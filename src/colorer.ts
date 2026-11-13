// The coloring screen: an SVG view on top of a ColoringSession.

import { ColoringSession } from './core/session';
import type { ColoringPage } from './pages/types';
import { regionMapFor } from './regionmap';
import { ICONS, h, highlightFor, iconButton, inkFor, svgEl } from './render';
import { loadPrefs, savePrefs } from './storage';
import { ViewController, type TapEvent } from './zoom';
import { confetti } from './confetti';

const MIN_LABEL_PX = 7; // labels smaller than this on screen are hidden until you zoom in
const FORGIVE_PX = 12; // how far (screen px) a tap may miss a small matching region

export function mountColorer(root: HTMLElement, page: ColoringPage): () => void {
  const session = new ColoringSession(page);
  const prefs = loadPrefs();
  session.freeMode = prefs.freeMode;
  const map = regionMapFor(page);
  const box = map.box;

  // ---------- layout ----------
  const back = h('a', { class: 'icon-btn', href: '#/', title: 'Back to gallery', 'aria-label': 'Back to gallery' });
  back.innerHTML = ICONS.back;
  const title = h('h1', { class: 'page-title', text: page.title });
  const barFill = h('span');
  const pct = h('span', { class: 'pct' });
  const progress = h('div', { class: 'progress', role: 'progressbar', 'aria-label': 'Progress' }, h('div', { class: 'bar' }, barFill), pct);

  const undoBtn = iconButton(ICONS.undo, 'Undo (Ctrl+Z)');
  const findBtn = iconButton(ICONS.find, 'Find next region of this color (F)');
  const zoomInBtn = iconButton(ICONS.zoomIn, 'Zoom in (+)', 'desk-only');
  const zoomOutBtn = iconButton(ICONS.zoomOut, 'Zoom out (−)', 'desk-only');
  const fitBtn = iconButton(ICONS.fit, 'Fit to screen (0)');
  const resetBtn = iconButton(ICONS.reset, 'Start over');
  const freeInput = h('input', { type: 'checkbox' });
  const freeToggle = h('label', { class: 'toggle', title: 'Paint any region with any color' }, freeInput, h('span', { text: 'Free color' }));
  const hintsInput = h('input', { type: 'checkbox' });
  hintsInput.checked = prefs.hints;
  const hintsToggle = h('label', { class: 'toggle', title: 'Stripe the spaces that match the selected color (H)' }, hintsInput, h('span', { text: 'Hints' }));

  const toolbar = h(
    'header',
    { class: 'toolbar' },
    h('div', { class: 'tb-left' }, back, title),
    progress,
    h('div', { class: 'tb-right' }, undoBtn, findBtn, zoomOutBtn, zoomInBtn, fitBtn, hintsToggle, freeToggle, resetBtn),
  );

  const svg = svgEl('svg', { class: 'art', viewBox: page.viewBox, preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': page.title });
  const defs = svgEl('defs');
  const pattern = svgEl('pattern', { id: 'hl', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' });
  const stripeBg = svgEl('rect', { width: 6, height: 6, fill: '#ffffff' });
  const stripe = svgEl('rect', { width: 2.5, height: 6, opacity: '0.5' });
  pattern.append(stripeBg, stripe);
  defs.append(pattern);
  const regionsG = svgEl('g', { class: 'regions' });
  const labelsG = svgEl('g', { class: 'labels', 'aria-hidden': 'true' });
  svg.append(defs, svgEl('rect', { x: box.x, y: box.y, width: box.w, height: box.h, fill: '#ffffff' }), regionsG, labelsG);

  const strokeW = page.outlineWidth ?? 1.4;
  const paths = page.regions.map((r) => {
    const p = svgEl('path', { d: r.d, 'data-id': r.id, class: 'region', 'stroke-width': strokeW });
    regionsG.appendChild(p);
    return p;
  });
  const labels = page.regions.map((r, i) => {
    const l = map.labels[i];
    if (!l) return null;
    const digits = String(r.color).length;
    const size = Math.min(22, l.radius * (digits > 1 ? 0.95 : 1.25));
    const t = svgEl('text', { x: l.x, y: l.y, 'font-size': size.toFixed(2), class: 'label', 'data-id': r.id });
    t.textContent = String(r.color);
    labelsG.appendChild(t);
    return { el: t, size };
  });

  const toast = h('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
  const stage = h('main', { class: 'stage' }, svg, toast);
  const palette = h('nav', { class: 'palette', 'aria-label': 'Colors' });
  const swatches = page.palette.map((c, i) => {
    const n = i + 1;
    const count = h('span', { class: 'count' });
    const b = h(
      'button',
      { class: 'swatch', type: 'button', style: `--c:${c.hex};--ink:${inkFor(c.hex)}`, title: `${n}: ${c.name}`, 'aria-label': `Color ${n}, ${c.name}` },
      h('span', { class: 'num', text: String(n) }),
      count,
    );
    b.addEventListener('click', () => session.select(n));
    palette.appendChild(b);
    return { b, count };
  });

  const doneDialog = h('div', { class: 'done', hidden: '' });
  const screen = h('div', { class: 'colorer' }, toolbar, stage, palette, doneDialog);
  root.replaceChildren(screen);

  // ---------- view ----------
  let viewRef: ViewController | undefined;
  const view = (viewRef = new ViewController(svg, box, onTap, updateLabelVisibility));

  function updateLabelVisibility(): void {
    const upp = viewRef ? viewRef.unitsPerPx() : 1;
    labels.forEach((l, i) => {
      if (!l) return;
      const visible = l.size / upp >= MIN_LABEL_PX && !labelHidden(i);
      l.el.style.display = visible ? '' : 'none';
    });
  }

  function labelHidden(i: number): boolean {
    const id = page.regions[i].id;
    return session.freeMode ? session.fillOf(id) !== undefined : session.isDone(id);
  }

  let toastTimer = 0;
  function say(msg: string): void {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 1600);
  }

  function render(): void {
    const sel = session.selected;
    stripe.setAttribute('fill', highlightFor(page.palette[sel - 1].hex));
    page.regions.forEach((r, i) => {
      const fill = session.fillOf(r.id);
      const p = paths[i];
      if (fill !== undefined) p.style.fill = page.palette[fill - 1].hex;
      else if (prefs.hints && !session.freeMode && r.color === sel) p.style.fill = 'url(#hl)';
      else p.style.fill = '#ffffff';
    });
    updateLabelVisibility();

    swatches.forEach(({ b, count }, i) => {
      const n = i + 1;
      const left = session.remaining(n).length;
      b.classList.toggle('selected', n === sel);
      b.classList.toggle('complete', left === 0);
      count.textContent = left === 0 ? '✓' : String(left);
      b.setAttribute('aria-pressed', String(n === sel));
    });

    const { done, total } = session.progress();
    const percent = Math.floor((done / total) * 100);
    barFill.style.width = `${(done / total) * 100}%`;
    pct.textContent = `${percent}%`;
    progress.setAttribute('aria-valuenow', String(percent));
    undoBtn.disabled = !session.canUndo();
    freeInput.checked = session.freeMode;
    screen.classList.toggle('free', session.freeMode);
  }

  function flash(i: number, cls: string, ms: number): void {
    const p = paths[i];
    p.classList.remove(cls);
    // restart the animation
    void p.getBoundingClientRect();
    p.classList.add(cls);
    window.setTimeout(() => p.classList.remove(cls), ms);
  }

  function fillIndex(i: number): void {
    const wasComplete = session.isComplete();
    const sel = session.selected;
    if (session.tryFill(page.regions[i].id) !== 'filled') return;
    flash(i, 'pop', 400);
    if (!session.freeMode && session.remaining(sel).length === 0) {
      const next = session.firstColorWithRemaining();
      if (next) {
        say(`All ${page.palette[sel - 1].name} done!`);
        session.select(next);
      }
    }
    if (!wasComplete && session.isComplete()) celebrate();
  }

  function onTap(e: TapEvent): void {
    const idx = map.hit(e.x, e.y);
    const region = idx >= 0 ? page.regions[idx] : undefined;
    if (region && session.canFill(region.id)) return fillIndex(idx);

    if (!session.freeMode) {
      // forgiving taps: a near miss on a small region of the selected color still counts
      const near = map.nearest(e.x, e.y, FORGIVE_PX * e.unitsPerPx, (i) => session.canFill(page.regions[i].id));
      if (near >= 0) return fillIndex(near);
      // touch: ignore stray taps silently; mouse/pen: show what's wrong
      if (region && e.pointerType !== 'touch' && !session.isDone(region.id)) {
        flash(idx, 'wrong', 450);
        say(`That one is ${region.color} (${page.palette[region.color - 1].name})`);
      }
    }
  }

  let findCursor = 0;
  function findNext(): void {
    let color = session.selected;
    let ids = session.remaining(color);
    if (!ids.length) {
      const next = session.firstColorWithRemaining();
      if (!next) return say('Everything is colored!');
      session.select(next);
      color = next;
      ids = session.remaining(color);
    }
    findCursor = (findCursor + 1) % ids.length;
    const i = page.regions.findIndex((r) => r.id === ids[findCursor]);
    const b = map.bounds[i];
    if (b) view.focus(b);
    flash(i, 'pulse', 1400);
  }

  function celebrate(): void {
    confetti(page.palette.map((c) => c.hex));
    doneDialog.replaceChildren(
      h(
        'div',
        { class: 'done-card', role: 'dialog', 'aria-label': 'Page complete' },
        h('h2', { text: 'You did it!' }),
        h('p', { text: `${page.title} is fully colored.` }),
        h('div', { class: 'done-actions' }, h('a', { class: 'btn primary', href: '#/', text: 'Pick another page' }), closeBtn()),
      ),
    );
    doneDialog.hidden = false;
    view.reset();
  }

  function closeBtn(): HTMLButtonElement {
    const b = h('button', { class: 'btn', type: 'button', text: 'Admire it' });
    b.addEventListener('click', () => (doneDialog.hidden = true));
    return b;
  }

  // ---------- controls ----------
  undoBtn.addEventListener('click', () => {
    const id = session.undo();
    if (id) {
      const i = page.regions.findIndex((r) => r.id === id);
      flash(i, 'pulse', 800);
    }
  });
  findBtn.addEventListener('click', findNext);
  zoomInBtn.addEventListener('click', () => view.zoomBy(1.5));
  zoomOutBtn.addEventListener('click', () => view.zoomBy(1 / 1.5));
  fitBtn.addEventListener('click', () => view.reset());
  resetBtn.addEventListener('click', () => {
    if (confirm(`Clear all colors on “${page.title}”?`)) {
      session.reset();
      view.reset();
    }
  });
  freeInput.addEventListener('change', () => {
    session.setFreeMode(freeInput.checked);
    prefs.freeMode = freeInput.checked;
    savePrefs(prefs);
    say(freeInput.checked ? 'Free color: paint anything any color' : 'Numbers on: match the colors');
  });

  hintsInput.addEventListener('change', () => {
    prefs.hints = hintsInput.checked;
    savePrefs(prefs);
    render();
    say(prefs.hints ? 'Hints on' : 'Hints off');
  });

  const onKey = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      undoBtn.click();
    } else if (/^[1-9]$/.test(e.key) && !e.ctrlKey && !e.metaKey) session.select(Number(e.key));
    else if (e.key === 'f') findNext();
    else if (e.key === 'h') hintsInput.click();
    else if (e.key === '+' || e.key === '=') view.zoomBy(1.5);
    else if (e.key === '-') view.zoomBy(1 / 1.5);
    else if (e.key === '0') view.reset();
    else if (e.key === 'Escape') doneDialog.hidden = true;
  };
  window.addEventListener('keydown', onKey);
  const onResize = () => updateLabelVisibility();
  window.addEventListener('resize', onResize);

  const unsubscribe = session.onChange(render);
  render();
  // the stage may only get its real size after layout
  requestAnimationFrame(updateLabelVisibility);

  return () => {
    unsubscribe();
    view.destroy();
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    clearTimeout(toastTimer);
  };
}

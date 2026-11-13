// Shared SVG helpers.

import type { ColoringPage } from './pages/types';

export const SVG_NS = 'http://www.w3.org/2000/svg';

export function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

/** Static thumbnail of a page with the given fills (no labels, no interaction). */
export function thumbnail(page: ColoringPage, fills: Record<string, number>): SVGSVGElement {
  const svg = svgEl('svg', { viewBox: page.viewBox, class: 'thumb', 'aria-hidden': 'true' });
  for (const r of page.regions) {
    const c = fills[r.id];
    svg.appendChild(
      svgEl('path', {
        d: r.d,
        fill: c ? page.palette[c - 1].hex : '#ffffff',
        stroke: '#1f2937',
        'stroke-width': 1,
        'vector-effect': 'non-scaling-stroke',
        'stroke-linejoin': 'round',
      }),
    );
  }
  return svg;
}

/** Stripe color for highlighting: very light colors are darkened so the stripes stay visible. */
export function highlightFor(hex: string): string {
  const v = parseInt(hex.slice(1), 16);
  let r = (v >> 16) & 255;
  let g = (v >> 8) & 255;
  let b = v & 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (lum > 200) {
    const k = 0.72;
    r = Math.round(r * k);
    g = Math.round(g * k);
    b = Math.round(b * k);
  }
  return `rgb(${r} ${g} ${b})`;
}

/** Black or white text, whichever reads better on `hex`. */
export function inkFor(hex: string): string {
  const v = parseInt(hex.slice(1), 16);
  const r = (v >> 16) & 255;
  const g = (v >> 8) & 255;
  const b = v & 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 150 ? '#111827' : '#ffffff';
}

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, string> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'text') el.textContent = v;
    else el.setAttribute(k, v);
  }
  for (const c of children) el.append(c);
  return el;
}

export const ICONS = {
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  undo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7H4V2M4.5 7A8 8 0 1 1 4 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  find: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 16l5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  zoomIn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  zoomOut: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  fit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  reset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

export function iconButton(icon: string, label: string, extraClass = ''): HTMLButtonElement {
  const b = h('button', { class: `icon-btn ${extraClass}`.trim(), type: 'button', title: label, 'aria-label': label });
  b.innerHTML = icon;
  return b;
}

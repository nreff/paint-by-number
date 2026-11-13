// Zoom and pan by rewriting the SVG viewBox.
// Mouse: wheel zooms, drag pans, click = tap.
// Touch: two-finger pinch zooms, one-finger drag pans, a clean tap = tap.

import type { Box } from './regionmap';

export interface TapEvent {
  x: number; // viewBox coords
  y: number;
  pointerType: string;
  /** Viewbox units per screen pixel at the time of the tap. */
  unitsPerPx: number;
}

const TAP_SLOP = 8; // px a pointer may move and still count as a tap
const MIN_ZOOM_FRACTION = 1 / 14;

export class ViewController {
  private svg: SVGSVGElement;
  private base: Box;
  view: Box;
  private pointers = new Map<number, { x: number; y: number; startX: number; startY: number }>();
  private gesture = false; // current interaction can no longer be a tap
  private pinch: { dist: number; anchor: [number, number]; view: Box } | null = null;
  private anim = 0;
  private onTap: (e: TapEvent) => void;
  private onViewChange: () => void;

  constructor(svg: SVGSVGElement, base: Box, onTap: (e: TapEvent) => void, onViewChange: () => void = () => {}) {
    this.svg = svg;
    this.base = base;
    this.view = { ...base };
    this.onTap = onTap;
    this.onViewChange = onViewChange;
    svg.style.touchAction = 'none';
    svg.addEventListener('pointerdown', this.down);
    svg.addEventListener('pointermove', this.move);
    svg.addEventListener('pointerup', this.up);
    svg.addEventListener('pointercancel', this.cancel);
    svg.addEventListener('wheel', this.wheel, { passive: false });
    this.apply();
  }

  /** Screen mapping for preserveAspectRatio="xMidYMid meet". */
  private metrics(view = this.view) {
    const r = this.svg.getBoundingClientRect();
    const s = Math.min(r.width / view.w, r.height / view.h) || 1;
    return { r, s, ox: (r.width - view.w * s) / 2, oy: (r.height - view.h * s) / 2 };
  }

  toView(clientX: number, clientY: number, view = this.view): [number, number] {
    const { r, s, ox, oy } = this.metrics(view);
    return [view.x + (clientX - r.left - ox) / s, view.y + (clientY - r.top - oy) / s];
  }

  unitsPerPx(): number {
    return 1 / this.metrics().s;
  }

  zoomLevel(): number {
    return this.base.w / this.view.w;
  }

  private apply(): void {
    const v = this.view;
    this.svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
    this.onViewChange();
  }

  private clamp(v: Box): Box {
    const maxW = this.base.w;
    const minW = this.base.w * MIN_ZOOM_FRACTION;
    let w = Math.min(maxW, Math.max(minW, v.w));
    let h = (v.h * w) / v.w;
    // keep the view centre inside the drawing
    let cx = v.x + v.w / 2;
    let cy = v.y + v.h / 2;
    cx = Math.min(this.base.x + this.base.w, Math.max(this.base.x, cx));
    cy = Math.min(this.base.y + this.base.h, Math.max(this.base.y, cy));
    if (w >= this.base.w) {
      cx = this.base.x + this.base.w / 2;
      cy = this.base.y + this.base.h / 2;
      h = this.base.h;
      w = this.base.w;
    }
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  }

  setView(v: Box): void {
    this.view = this.clamp(v);
    this.apply();
  }

  /** Zoom by `factor` (>1 zooms in) keeping the point under (clientX, clientY) fixed. */
  zoomAt(clientX: number, clientY: number, factor: number): void {
    const [px, py] = this.toView(clientX, clientY);
    const v = this.view;
    this.setView({
      x: px - (px - v.x) / factor,
      y: py - (py - v.y) / factor,
      w: v.w / factor,
      h: v.h / factor,
    });
  }

  zoomBy(factor: number): void {
    const r = this.svg.getBoundingClientRect();
    this.zoomAt(r.left + r.width / 2, r.top + r.height / 2, factor);
  }

  reset(animate = true): void {
    if (animate) this.animateTo(this.base);
    else this.setView(this.base);
  }

  /** Smoothly frame a box (viewBox units) with some padding. */
  focus(box: Box, padding = 2.2): void {
    const w = Math.max(box.w, box.h) * padding;
    const size = Math.min(this.base.w, Math.max(w, this.base.w * 0.25));
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    const h = size * (this.base.h / this.base.w);
    this.animateTo({ x: cx - size / 2, y: cy - h / 2, w: size, h });
  }

  animateTo(target: Box, ms = 380): void {
    cancelAnimationFrame(this.anim);
    const from = { ...this.view };
    const to = this.clamp(target);
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      this.view = {
        x: from.x + (to.x - from.x) * e,
        y: from.y + (to.y - from.y) * e,
        w: from.w + (to.w - from.w) * e,
        h: from.h + (to.h - from.h) * e,
      };
      this.apply();
      if (k < 1) this.anim = requestAnimationFrame(step);
    };
    this.anim = requestAnimationFrame(step);
  }

  private startPinch(): void {
    const [a, b] = [...this.pointers.values()];
    const mid: [number, number] = [(a.x + b.x) / 2, (a.y + b.y) / 2];
    this.pinch = {
      dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
      anchor: this.toView(mid[0], mid[1]),
      view: { ...this.view },
    };
  }

  private down = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    cancelAnimationFrame(this.anim);
    this.svg.setPointerCapture(e.pointerId);
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY });
    if (this.pointers.size >= 2) {
      this.gesture = true;
      this.startPinch();
    }
  };

  private move = (e: PointerEvent) => {
    const p = this.pointers.get(e.pointerId);
    if (!p) return;
    const prevX = p.x;
    const prevY = p.y;
    p.x = e.clientX;
    p.y = e.clientY;
    if (Math.hypot(p.x - p.startX, p.y - p.startY) > TAP_SLOP) this.gesture = true;

    if (this.pointers.size >= 2 && this.pinch) {
      const [a, b] = [...this.pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const f = dist / this.pinch.dist;
      const v0 = this.pinch.view;
      const w = v0.w / f;
      const h = v0.h / f;
      const mid: [number, number] = [(a.x + b.x) / 2, (a.y + b.y) / 2];
      // place the anchor point under the current finger midpoint
      const trial = { x: 0, y: 0, w, h };
      const [tx, ty] = this.toView(mid[0], mid[1], trial);
      this.setView({ x: this.pinch.anchor[0] - tx, y: this.pinch.anchor[1] - ty, w, h });
      return;
    }
    if (this.pointers.size === 1 && this.gesture) {
      const s = this.metrics().s;
      const v = this.view;
      this.setView({ ...v, x: v.x - (p.x - prevX) / s, y: v.y - (p.y - prevY) / s });
    }
  };

  private up = (e: PointerEvent) => {
    const p = this.pointers.get(e.pointerId);
    if (!p) return;
    this.pointers.delete(e.pointerId);
    if (this.pointers.size === 1) {
      // one finger lifted mid-pinch: continue as a pan with the remaining finger
      this.pinch = null;
      return;
    }
    if (this.pointers.size === 0) {
      const wasTap = !this.gesture;
      this.gesture = false;
      this.pinch = null;
      if (wasTap) {
        const [x, y] = this.toView(e.clientX, e.clientY);
        this.onTap({ x, y, pointerType: e.pointerType, unitsPerPx: this.unitsPerPx() });
      }
    }
  };

  private cancel = (e: PointerEvent) => {
    this.pointers.delete(e.pointerId);
    if (this.pointers.size === 0) {
      this.gesture = false;
      this.pinch = null;
    }
  };

  private wheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    this.zoomAt(e.clientX, e.clientY, Math.exp(-delta * 0.0018));
  };

  destroy(): void {
    cancelAnimationFrame(this.anim);
    this.svg.removeEventListener('pointerdown', this.down);
    this.svg.removeEventListener('pointermove', this.move);
    this.svg.removeEventListener('pointerup', this.up);
    this.svg.removeEventListener('pointercancel', this.cancel);
    this.svg.removeEventListener('wheel', this.wheel);
  }
}

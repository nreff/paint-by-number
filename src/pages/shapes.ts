// Tiny helpers for hand-authoring pages. They only emit SVG path strings, so
// the page data stays a plain `ColoringPage` (same as generated pages will be).

import type { Region } from './types';

type Pt = [number, number];

const n = (v: number) => (Math.round(v * 10) / 10).toString();
const p = ([x, y]: Pt) => `${n(x)} ${n(y)}`;

export const rect = (x: number, y: number, w: number, h: number) =>
  `M${n(x)} ${n(y)}H${n(x + w)}V${n(y + h)}H${n(x)}Z`;

export const circle = (cx: number, cy: number, r: number) =>
  `M${n(cx - r)} ${n(cy)}A${n(r)} ${n(r)} 0 1 0 ${n(cx + r)} ${n(cy)}A${n(r)} ${n(r)} 0 1 0 ${n(cx - r)} ${n(cy)}Z`;

export const ellipse = (cx: number, cy: number, rx: number, ry: number, rotDeg = 0) => {
  const a = (rotDeg * Math.PI) / 180;
  const dx = rx * Math.cos(a);
  const dy = rx * Math.sin(a);
  const arc = `A${n(rx)} ${n(ry)} ${n(rotDeg)} 1 0`;
  return `M${p([cx - dx, cy - dy])}${arc} ${p([cx + dx, cy + dy])}${arc} ${p([cx - dx, cy - dy])}Z`;
};

export const poly = (pts: Pt[]) => `M${pts.map(p).join('L')}Z`;

/** Closed smooth curve through the points (Catmull-Rom converted to cubic Béziers). */
export const smooth = (pts: Pt[]) => {
  const len = pts.length;
  let d = `M${p(pts[0])}`;
  for (let i = 0; i < len; i++) {
    const p0 = pts[(i - 1 + len) % len];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % len];
    const p3 = pts[(i + 2) % len];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${p(c1)} ${p(c2)} ${p(p2)}`;
  }
  return d + 'Z';
};

/** Leaf / petal: pointed at both ends, from base to tip, `w` = half-width. */
export const leaf = (x1: number, y1: number, x2: number, y2: number, w: number) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const px = (-(y2 - y1) / len) * w * 2;
  const py = ((x2 - x1) / len) * w * 2;
  return `M${p([x1, y1])}Q${p([mx + px, my + py])} ${p([x2, y2])}Q${p([mx - px, my - py])} ${p([x1, y1])}Z`;
};

/** Petal of length `len` pointing at angle `deg` from (cx, cy). */
export const petal = (cx: number, cy: number, len: number, w: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return leaf(cx, cy, cx + Math.cos(a) * len, cy + Math.sin(a) * len, w);
};

export const star = (cx: number, cy: number, outer: number, inner: number, points = 5) => {
  const pts: Pt[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? inner : outer;
    const a = (Math.PI * i) / points - Math.PI / 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return poly(pts);
};

/** Cloud with a flat bottom; (x, y) is the bottom-left corner, w the width. */
export const cloud = (x: number, y: number, w: number) => {
  const pts: Pt[] = [
    [x + w, y],
    [x + w * 0.78, y - w * 0.3],
    [x + w * 0.45, y - w * 0.42],
    [x + w * 0.18, y - w * 0.24],
    [x, y],
  ];
  let d = `M${p([x, y])}L${p(pts[0])}`;
  for (let i = 1; i < pts.length; i++) {
    const chord = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const r = chord * 0.52;
    d += `A${n(r)} ${n(r)} 0 0 0 ${p(pts[i])}`;
  }
  return d + 'Z';
};

export const mirrorX = (pts: Pt[], axis: number): Pt[] => pts.map(([x, y]) => [2 * axis - x, y]);

export const scalePts = (pts: Pt[], k: number): Pt[] => {
  const cx = pts.reduce((s, q) => s + q[0], 0) / pts.length;
  const cy = pts.reduce((s, q) => s + q[1], 0) / pts.length;
  return pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
};

/** Turn [d, color] pairs into regions with stable ids r0, r1, ... */
export const regions = (list: [string, number][]): Region[] =>
  list.map(([d, color], i) => ({ id: `r${i}`, d, color }));

export type { Pt };

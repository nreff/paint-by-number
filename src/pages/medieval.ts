// Reusable medieval pieces: castle parts and a posable knight.
// Everything returns plain [pathData, colorNumber] entries.

import { circle, poly, smooth, star, type Pt } from './shapes';

export type Entry = [string, number];

/** Wall/keep outline with merlons (crenellations) along the top. */
export const battlement = (x: number, y: number, w: number, h: number, merlons: number, notch: number) => {
  const segs = merlons * 2 - 1;
  const pts: Pt[] = [];
  for (let s = 0; s < segs; s++) {
    const level = s % 2 === 0 ? y : y + notch;
    pts.push([x + (s * w) / segs, level], [x + ((s + 1) * w) / segs, level]);
  }
  pts.push([x + w, y + h], [x, y + h]);
  return poly(pts);
};

/** Window or doorway with a round top. */
export const arch = (x: number, y: number, w: number, h: number) =>
  `M${r(x)} ${r(y + h)}V${r(y + w / 2)}A${r(w / 2)} ${r(w / 2)} 0 0 1 ${r(x + w)} ${r(y + w / 2)}V${r(y + h)}Z`;

/** Hanging banner with a notched bottom. */
export const banner = (x: number, y: number, w: number, h: number) =>
  poly([[x, y], [x + w, y], [x + w, y + h], [x + w / 2, y + h - 8], [x, y + h]]);

export const plus = (cx: number, cy: number, arm: number, t: number) =>
  poly([
    [cx - t, cy - arm], [cx + t, cy - arm], [cx + t, cy - t], [cx + arm, cy - t], [cx + arm, cy + t], [cx + t, cy + t],
    [cx + t, cy + arm], [cx - t, cy + arm], [cx - t, cy + t], [cx - arm, cy + t], [cx - arm, cy - t], [cx - t, cy - t],
  ]);

/** Heater shield (flat top, pointed bottom). `side` picks the full shape or one half. */
export const heater = (x: number, y: number, w: number, h: number, side: 'full' | 'left' | 'right' = 'full') => {
  const cx = x + w / 2;
  const mid = y + h * 0.42;
  const curve = y + h * 0.81;
  const bottom = y + h;
  if (side === 'left') return `M${r(x)} ${r(y)}H${r(cx)}V${r(bottom)}Q${r(x)} ${r(curve)} ${r(x)} ${r(mid)}Z`;
  if (side === 'right') return `M${r(cx)} ${r(y)}H${r(x + w)}V${r(mid)}Q${r(x + w)} ${r(curve)} ${r(cx)} ${r(bottom)}Z`;
  return `M${r(x)} ${r(y)}H${r(x + w)}V${r(mid)}Q${r(x + w)} ${r(curve)} ${r(cx)} ${r(bottom)}Q${r(x)} ${r(curve)} ${r(x)} ${r(mid)}Z`;
};

const r = (v: number) => (Math.round(v * 10) / 10).toString();

/** Thick straight bar between two points (sword blades, poles, ropes, planks). */
export const bar = (a: Pt, b: Pt, w: number) => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const px = (-(b[1] - a[1]) / len) * (w / 2);
  const py = ((b[0] - a[0]) / len) * (w / 2);
  return poly([[a[0] + px, a[1] + py], [b[0] + px, b[1] + py], [b[0] - px, b[1] - py], [a[0] - px, a[1] - py]]);
};

export interface KnightColors {
  steel: number;
  iron: number;
  shadow: number;
  tabard: number;
  emblem: number;
  belt: number;
  plume: number;
  shieldRim: number;
  shieldA: number;
  shieldB: number;
  shieldMark: number;
  wood: number;
  pennant?: number;
}

export interface KnightOptions {
  /** Feet position. */
  x: number;
  y: number;
  scale?: number;
  /** 1 = facing right, -1 = facing left. */
  facing?: 1 | -1;
  weapon: 'sword-high' | 'sword-forward' | 'lance' | 'spear';
  colors: KnightColors;
}

/**
 * A standing knight in armor with a plumed helmet, tabard, shield and weapon.
 * Drawn in local coordinates (feet at 0,0, about 200 units tall) and mapped to the page.
 */
export function knight(o: KnightOptions): Entry[] {
  const s = o.scale ?? 1;
  const f = o.facing ?? 1;
  const c = o.colors;
  const T = ([x, y]: Pt): Pt => [o.x + s * f * x, o.y + s * y];
  const P = (pts: Pt[]) => poly(pts.map(T));
  const C = (cx: number, cy: number, rad: number) => {
    const [gx, gy] = T([cx, cy]);
    return circle(gx, gy, rad * s);
  };
  const B = (a: Pt, b: Pt, w: number) => bar(T(a), T(b), w * s);
  /** Left edge in page space of a shape spanning local x..x+w. */
  const left = (x: number, w: number) => Math.min(T([x, 0])[0], T([x + w, 0])[0]);

  const out: Entry[] = [];

  // weapon held at the side goes behind the body
  const hand: Pt = o.weapon === 'sword-high' ? [40, -156] : o.weapon === 'sword-forward' ? [44, -100] : [29, -76];
  if (o.weapon === 'lance' || o.weapon === 'spear') {
    const thick = o.weapon === 'lance' ? 6 : 4;
    out.push([B([32, -40], [58, -262], thick), c.wood]);
    out.push([P([[51, -258], [65, -260], [61, -290]]), c.iron]);
    if (o.weapon === 'lance' && c.pennant) out.push([P([[58, -250], [82, -242], [59, -234]]), c.pennant]);
  }

  // legs, boots
  out.push([P([[-14, -62], [-3, -62], [-3, -12], [-14, -12]]), c.steel]);
  out.push([P([[3, -62], [14, -62], [14, -12], [3, -12]]), c.steel]);
  out.push([P([[-20, -15], [-1, -15], [-1, 0], [-20, 0]]), c.iron]);
  out.push([P([[1, -15], [21, -15], [21, 0], [1, 0]]), c.iron]);
  // torso, tabard, emblem, belt
  out.push([P([[-22, -120], [22, -120], [18, -60], [-18, -60]]), c.steel]);
  out.push([P([[-14, -114], [14, -114], [12, -50], [-12, -50]]), c.tabard]);
  {
    const [ex, ey] = T([0, -94]);
    out.push([star(ex, ey, 9 * s, 4 * s), c.emblem]);
  }
  out.push([P([[-19, -72], [19, -72], [19, -64], [-19, -64]]), c.belt]);
  out.push([P([[-4, -73.5], [4, -73.5], [4, -62.5], [-4, -62.5]]), c.emblem]);
  out.push([C(-21, -114, 9), c.iron]);
  // helmet, visor, plume (plume trails behind)
  {
    const [, top] = T([0, -170]);
    out.push([arch(left(-15, 30), top, 30 * s, 51 * s), c.steel]);
    out.push([P([[-11, -150], [11, -150], [11, -145], [-11, -145]]), c.shadow]);
    out.push([P([[-1.5, -143], [1.5, -143], [1.5, -127], [-1.5, -127]]), c.shadow]);
    out.push([
      smooth(([[2, -167], [9, -185], [-3, -198], [-25, -195], [-19, -183], [-7, -179], [-5, -168]] as Pt[]).map(T)),
      c.plume,
    ]);
  }
  // shield on the back arm
  {
    const [, top] = T([0, -114]);
    const x0 = left(-54, 36);
    const w = 36 * s;
    const h = 72 * s;
    const inset = 5 * s;
    out.push([heater(x0, top, w, h), c.shieldRim]);
    out.push([heater(x0 + inset, top + inset, w - inset * 2, h - inset * 2.2, 'left'), c.shieldA]);
    out.push([heater(x0 + inset, top + inset, w - inset * 2, h - inset * 2.2, 'right'), c.shieldB]);
    const [mx, my] = T([-36, -86]);
    out.push([star(mx, my, 9 * s, 4 * s), c.shieldMark]);
  }
  // sword in front
  if (o.weapon === 'sword-high' || o.weapon === 'sword-forward') {
    const ang = ((o.weapon === 'sword-high' ? -62 : -28) * Math.PI) / 180;
    const d: Pt = [Math.cos(ang), Math.sin(ang)];
    const p: Pt = [-d[1], d[0]];
    const at = (k: number, j = 0): Pt => [hand[0] + d[0] * k + p[0] * j, hand[1] + d[1] * k + p[1] * j];
    out.push([P([at(9, -3), at(78, -3), at(90, 0), at(78, 3), at(9, 3)]), c.steel]);
    out.push([P([at(6, -13), at(6, 13), at(10, 13), at(10, -13)]), c.emblem]);
  }
  // front arm, gauntlet, front shoulder plate
  const shoulder: Pt = [21, -112];
  out.push([B(shoulder, hand, 12), c.steel]);
  out.push([C(hand[0], hand[1], 7), c.iron]);
  if (o.weapon === 'sword-high' || o.weapon === 'sword-forward') {
    // pommel just past the fist, drawn on top so the arm never hides it
    const ang = ((o.weapon === 'sword-high' ? -62 : -28) * Math.PI) / 180;
    out.push([C(hand[0] - Math.cos(ang) * 11, hand[1] - Math.sin(ang) * 11, 4), c.emblem]);
  }
  out.push([C(21, -114, 9), c.iron]);
  return out;
}

export type { Pt };

import type { ColoringPage } from './types';
import { circle, leaf, poly, rect, regions, star, type Pt } from './shapes';
import type { Entry } from './medieval';

const C = 200;

const at = (r: number, deg: number): Pt => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + Math.cos(a) * r, C + Math.sin(a) * r];
};

/** Pointed petal lying along a ray from radius r0 to r1. */
const ray = (r0: number, r1: number, deg: number, w: number): string => {
  const [x1, y1] = at(r0, deg);
  const [x2, y2] = at(r1, deg);
  return leaf(x1, y1, x2, y2, w);
};

/** Ring of `n` items, color picked by index. */
const ring = (n: number, offset: number, make: (deg: number, i: number) => Entry[]): Entry[] =>
  Array.from({ length: n }, (_, i) => make(offset + (i * 360) / n, i)).flat();

/** Rounded scallop "teardrop" pointing outward: a circle with a peak. */
const drop = (r: number, deg: number, size: number): string => {
  const [cx, cy] = at(r, deg);
  const tip = at(r + size * 1.9, deg);
  const a = ((deg - 90) * Math.PI) / 180;
  const px = -Math.sin(a) * size;
  const py = Math.cos(a) * size;
  return `M${(cx + px).toFixed(1)} ${(cy + py).toFixed(1)}A${size} ${size} 0 1 1 ${(cx - px).toFixed(1)} ${(cy - py).toFixed(1)}L${tip[0].toFixed(1)} ${tip[1].toFixed(1)}Z`;
};

const corner = (cx: number, cy: number, start: number): Entry[] => {
  const out: Entry[] = [];
  const rr = (r: number, deg: number): Pt => {
    const a = (deg * Math.PI) / 180;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  out.push([`M${cx} ${cy}L${rr(70, start)[0]} ${rr(70, start)[1]}A70 70 0 0 1 ${rr(70, start + 90)[0].toFixed(1)} ${rr(70, start + 90)[1].toFixed(1)}Z`, 9]);
  for (let i = 0; i < 5; i++) {
    const deg = start + 9 + i * 18;
    const [x1, y1] = rr(18, deg);
    const [x2, y2] = rr(62, deg);
    out.push([leaf(x1, y1, x2, y2, 5), i % 2 ? 4 : 6]);
  }
  out.push([`M${cx} ${cy}L${rr(22, start)[0].toFixed(1)} ${rr(22, start)[1].toFixed(1)}A22 22 0 0 1 ${rr(22, start + 90)[0].toFixed(1)} ${rr(22, start + 90)[1].toFixed(1)}Z`, 3]);
  return out;
};

export const mandala: ColoringPage = {
  id: 'mandala',
  title: 'Sunburst Mandala',
  viewBox: '0 0 400 400',
  palette: [
    { hex: '#1e1b4b', name: 'Midnight' },
    { hex: '#7c3aed', name: 'Violet' },
    { hex: '#f59e0b', name: 'Amber' },
    { hex: '#ec4899', name: 'Magenta' },
    { hex: '#14b8a6', name: 'Teal' },
    { hex: '#fde68a', name: 'Butter' },
    { hex: '#f97316', name: 'Tangerine' },
    { hex: '#e0f2fe', name: 'Ice' },
    { hex: '#4338ca', name: 'Indigo' },
    { hex: '#be123c', name: 'Ruby' },
    { hex: '#a7f3d0', name: 'Mint' },
    { hex: '#fbcfe8', name: 'Blush' },
    { hex: '#0e7490', name: 'Deep Teal' },
    { hex: '#facc15', name: 'Gold' },
  ],
  regions: regions([
    [rect(0, 0, 400, 400), 1],
    ...corner(0, 0, 0),
    ...corner(400, 0, 90),
    ...corner(400, 400, 180),
    ...corner(0, 400, 270),

    // outer sunburst: long petals with a second set between them
    ...ring(16, 0, (d, i) => [[ray(112, 194, d, 13), i % 2 ? 2 : 4]]),
    ...ring(16, 11.25, (d) => [[ray(118, 172, d, 8), 5]]),
    ...ring(16, 0, (d) => [[ray(124, 172, d, 5.5), 12]]),
    ...ring(16, 11.25, (d) => [[circle(...at(180, d), 4.5), 14]]),

    // scalloped band
    [circle(C, C, 128), 9],
    ...ring(24, 0, (d, i) => [[drop(118, d, 8), i % 2 ? 3 : 7]]),
    [circle(C, C, 116), 13],
    ...ring(36, 0, (d) => [[circle(...at(110, d), 3.6), 8]]),
    [circle(C, C, 104), 10],

    // 12 nested petals
    ...ring(12, 0, (d, i) => [
      [ray(46, 102, d, 13), i % 2 ? 7 : 3],
      [ray(54, 96, d, 8), 6],
      [ray(62, 90, d, 4), i % 2 ? 10 : 4],
    ]),
    ...ring(12, 15, (d) => [[ray(70, 100, d, 4.5), 11], [circle(...at(102, d), 3.6), 6]]),

    // inner star and center flower
    [circle(C, C, 52), 2],
    [star(C, C, 52, 30, 8), 6],
    ...ring(8, 22.5, (d) => [[circle(...at(42, d), 4.5), 4]]),
    [circle(C, C, 30), 13],
    ...ring(8, 0, (d, i) => [[ray(6, 28, d, 5.5), i % 2 ? 11 : 12]]),
    [circle(C, C, 8), 14],
    [poly([...Array.from({ length: 6 }, (_, i) => at(4, i * 60))]), 7],
  ]),
};

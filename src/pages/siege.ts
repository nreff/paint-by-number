import type { ColoringPage } from './types';
import { circle, leaf, poly, rect, regions, smooth, type Pt } from './shapes';
import { arch, banner, bar, battlement, knight, type Entry } from './medieval';

const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

const ladder = (b1: Pt, t1: Pt, b2: Pt, t2: Pt, rungs: number): Entry[] => {
  const out: Entry[] = [];
  for (let i = 1; i <= rungs; i++) {
    const t = i / (rungs + 1);
    out.push([bar(lerp(b1, t1, t), lerp(b2, t2, t), 3), 8]);
  }
  out.push([bar(b1, t1, 4), 8], [bar(b2, t2, 4), 8]);
  return out;
};

/** Small helmeted defender peeking over the wall. */
const defender = (x: number, top: number, tabard: number): Entry[] => [
  [rect(x - 8, top + 15, 16, 10), tabard],
  [arch(x - 6, top, 12, 17), 12],
  [rect(x - 4.5, top + 7, 9, 2.5), 14],
];

const wheel = (cx: number, cy: number, rad: number): Entry[] => [
  [circle(cx, cy, rad), 8],
  [circle(cx, cy, rad * 0.32), 13],
];

const flame = (x: number, y: number, h: number, lean: number): Entry[] => [
  [leaf(x, y, x + lean, y - h, h * 0.22), 15],
  [leaf(x, y - h * 0.08, x + lean * 0.7, y - h * 0.7, h * 0.12), 11],
];

const arrow = (a: Pt, b: Pt): Entry[] => {
  const d: Pt = [b[0] - a[0], b[1] - a[1]];
  const len = Math.hypot(d[0], d[1]);
  const u: Pt = [d[0] / len, d[1] / len];
  const p: Pt = [-u[1], u[0]];
  return [
    [bar(a, b, 2), 7],
    [poly([[b[0] + u[0] * 7, b[1] + u[1] * 7], [b[0] + p[0] * 3.5, b[1] + p[1] * 3.5], [b[0] - p[0] * 3.5, b[1] - p[1] * 3.5]]), 13],
    [poly([a, [a[0] + u[0] * 8 + p[0] * 4, a[1] + u[1] * 8 + p[1] * 4], [a[0] + u[0] * 8, a[1] + u[1] * 8]]), 9],
  ];
};

const blue = { steel: 12, iron: 13, shadow: 14, tabard: 10, emblem: 11, belt: 7, plume: 11, shieldRim: 11, shieldA: 10, shieldB: 12, shieldMark: 11, wood: 7 };
const red = { steel: 12, iron: 13, shadow: 14, tabard: 9, emblem: 11, belt: 7, plume: 10, shieldRim: 11, shieldA: 9, shieldB: 5, shieldMark: 11, wood: 7 };

export const siege: ColoringPage = {
  id: 'siege',
  title: 'Castle Siege',
  viewBox: '0 0 400 400',
  palette: [
    { hex: '#fdba74', name: 'Sunset' },
    { hex: '#d1d5db', name: 'Smoke' },
    { hex: '#65a30d', name: 'Grass' },
    { hex: '#a16207', name: 'Mud' },
    { hex: '#e7dcc8', name: 'Light Stone' },
    { hex: '#a8977a', name: 'Dark Stone' },
    { hex: '#92400e', name: 'Wood' },
    { hex: '#d97706', name: 'Light Wood' },
    { hex: '#dc2626', name: 'Red' },
    { hex: '#2563eb', name: 'Blue' },
    { hex: '#facc15', name: 'Gold' },
    { hex: '#cbd5e1', name: 'Steel' },
    { hex: '#64748b', name: 'Iron' },
    { hex: '#1e293b', name: 'Shadow' },
    { hex: '#f97316', name: 'Flame' },
    { hex: '#c4b5fd', name: 'Dusk' },
  ],
  regions: regions([
    // sky, sun, hills, ground
    [rect(0, 0, 400, 400), 1],
    [rect(0, 0, 400, 105), 16],
    [circle(70, 168, 32), 11],
    ['M0 212Q80 172 160 205T320 196T400 200V400H0Z', 3],
    ['M0 282Q200 268 400 282V400H0Z', 4],

    // smoke rising from the burning tower
    [smooth([[330, 70], [340, 42], [372, 30], [398, 46], [392, 76], [360, 86]]), 2],
    [smooth([[300, 40], [312, 14], [342, 8], [358, 26], [340, 46], [314, 52]]), 2],

    // flying boulder and arrows
    ...[[132, 88, 158, 78], [128, 102, 156, 92], [136, 116, 160, 104]].map(([a, b, c2, d]): Entry => [leaf(a, b, c2, d, 2.2), 2]),
    [circle(172, 76, 12), 6],
    ...arrow([300, 120], [262, 132]),
    ...arrow([290, 150], [250, 158]),

    // defenders behind the wall
    ...defender(293, 178, 9),
    ...defender(264, 178, 9),
    ...defender(321, 178, 9),
    [bar([329, 200], [334, 150], 3), 7],
    [poly([[331, 152], [337, 152], [335, 138]]), 13],

    // castle: wall, towers, gate
    [battlement(215, 190, 185, 110, 7, 10), 5],
    [rect(226, 230, 18, 8), 6],
    [rect(250, 262, 18, 8), 6],
    [rect(336, 240, 18, 8), 6],
    [rect(330, 274, 18, 8), 6],
    [banner(266, 210, 18, 34), 9],
    [circle(275, 223, 4.5), 11],
    [arch(290, 238, 40, 62), 7],
    [rect(290, 256, 40, 4), 13],
    [rect(290, 280, 40, 4), 13],
    [circle(320, 270, 3), 13],
    [battlement(196, 130, 52, 170, 3, 9), 6],
    [arch(215, 160, 13, 24), 14],
    [arch(215, 220, 13, 24), 14],
    [battlement(345, 112, 55, 188, 3, 9), 6],
    [arch(366, 150, 13, 24), 14],
    [arch(366, 210, 13, 24), 14],
    ...flame(356, 116, 46, -4),
    ...flame(378, 116, 58, 4),
    ...flame(394, 118, 34, 2),

    // ladder against the wall
    ...ladder([256, 302], [268, 190], [276, 302], [288, 190], 6),

    // siege tower rolling up to the walls
    [poly([[134, 300], [192, 300], [188, 138], [138, 138]]), 7],
    ...[160, 200, 240, 280].map((y): Entry => [rect(136, y, 54, 8), 8]),
    [arch(152, 210, 22, 30), 14],
    [battlement(134, 112, 58, 28, 3, 7), 8],
    ...defender(163, 98, 10),
    [bar([190, 140], [210, 128], 5), 8],
    [circle(141, 178, 7), 10],
    [circle(141, 178, 2.5), 11],
    [circle(185, 254, 7), 10],
    [circle(185, 254, 2.5), 11],
    ...wheel(146, 300, 14),
    ...wheel(180, 300, 14),

    // catapult
    [bar([40, 291], [112, 198], 6), 8],
    [circle(114, 195, 9), 7],
    [circle(114, 195, 5), 6],
    [rect(26, 280, 24, 18), 13],
    [bar([52, 300], [72, 242], 6), 7],
    [bar([94, 300], [72, 242], 6), 7],
    [circle(72, 242, 5), 13],
    [rect(16, 296, 106, 8), 7],
    ...wheel(32, 306, 12),
    ...wheel(104, 306, 12),

    // fighters in front
    ...knight({ x: 64, y: 388, scale: 0.72, facing: 1, weapon: 'sword-high', colors: blue }),
    ...knight({ x: 212, y: 392, scale: 0.78, facing: 1, weapon: 'spear', colors: blue }),
    ...knight({ x: 330, y: 388, scale: 0.74, facing: -1, weapon: 'sword-forward', colors: red }),

    // rubble
    [smooth([[248, 392], [254, 380], [268, 378], [274, 390], [262, 397]]), 6],
    [smooth([[120, 372], [126, 364], [138, 365], [140, 375], [130, 380]]), 6],
  ]),
};

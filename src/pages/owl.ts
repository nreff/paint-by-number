import type { ColoringPage } from './types';
import { circle, cloud, leaf, mirrorX, poly, rect, regions, smooth, star, type Pt } from './shapes';
import { bar, type Entry } from './medieval';

const both = (pts: Pt[], color: number): Entry[] => [
  [smooth(pts), color],
  [smooth(mirrorX(pts, 200)), color],
];

/** Chevron-shaped breast feather. */
const chevron = (x: number, y: number): string =>
  poly([[x - 6, y], [x, y + 5], [x + 6, y], [x + 6, y + 3.5], [x, y + 8.5], [x - 6, y + 3.5]]);

const eye = (cx: number): Entry[] => [
  [circle(cx, 142, 18), 9],
  [circle(cx, 142, 9.5), 10],
  [circle(cx + 3.5, 138, 3), 16],
];

const pine = (x: number, base: number, h: number): Entry[] => [
  [poly([[x - h * 0.32, base], [x, base - h], [x + h * 0.32, base]]), 14],
];

const talons = (x: number): Entry[] =>
  [-7, 0, 7].map((dx): Entry => [poly([[x + dx - 3, 318], [x + dx + 3, 318], [x + dx + 1, 330]]), 11]);

/** Bat silhouette with pointed ears and scalloped wings. */
const bat = (x: number, y: number, k: number): string => {
  const right: Pt[] = [[1.5, -7], [3, -3], [8, -5], [18, -9], [15, 0], [12, -2], [9, 3], [6, 1], [3, 5]];
  const left: Pt[] = right.map(([px, py]): Pt => [-px, py]).reverse();
  const pts: Pt[] = [[0, -4], ...right, [0, 8], ...left];
  return poly(pts.map(([px, py]): Pt => [x + px * k, y + py * k]));
};

export const owl: ColoringPage = {
  id: 'owl',
  title: 'Night Owl',
  viewBox: '0 0 400 400',
  palette: [
    { hex: '#1e3a8a', name: 'Night Blue' },
    { hex: '#312e81', name: 'Deep Indigo' },
    { hex: '#fef9c3', name: 'Moon' },
    { hex: '#fde68a', name: 'Moon Shadow' },
    { hex: '#b45309', name: 'Owl Brown' },
    { hex: '#78350f', name: 'Dark Feather' },
    { hex: '#fef3c7', name: 'Cream' },
    { hex: '#fcd9a8', name: 'Face Tan' },
    { hex: '#facc15', name: 'Gold' },
    { hex: '#0f172a', name: 'Black' },
    { hex: '#f97316', name: 'Beak Orange' },
    { hex: '#78716c', name: 'Bark' },
    { hex: '#22c55e', name: 'Leaf' },
    { hex: '#14532d', name: 'Forest' },
    { hex: '#64748b', name: 'Cloud Slate' },
    { hex: '#ffffff', name: 'Sparkle' },
  ],
  regions: regions([
    // night sky, moon, stars
    [rect(0, 0, 400, 400), 1],
    [rect(0, 0, 400, 110), 2],
    [circle(318, 82, 46), 3],
    [circle(300, 70, 9), 4],
    [circle(332, 100, 12), 4],
    [circle(340, 62, 6), 4],
    [cloud(270, 140, 96), 15],
    [cloud(30, 96, 70), 15],
    ...([[40, 40, 8], [120, 28, 6], [205, 52, 7], [250, 22, 5], [380, 160, 6], [26, 170, 5], [372, 236, 7], [130, 84, 5]] as const).map(
      ([x, y, r]): Entry => [star(x, y, r, r * 0.45), 9],
    ),
    [bat(80, 140, 1.7), 10],
    [bat(176, 44, 1.3), 10],

    // distant forest
    ...pine(30, 330, 90),
    ...pine(78, 340, 70),
    ...pine(340, 330, 100),
    ...pine(388, 336, 74),
    ['M0 360Q200 344 400 360V400H0Z', 14],

    // tail behind the branch
    [poly([[184, 300], [216, 300], [212, 352], [188, 352]]), 6],

    // branch with twigs and leaves
    [bar([62, 322], [26, 270], 6), 12],
    [bar([336, 316], [372, 268], 6), 12],
    ['M0 334Q100 314 200 324T400 302V322Q300 342 200 346T0 356Z', 12],
    [leaf(60, 336, 110, 330, 2), 6],
    [leaf(260, 330, 320, 322, 2), 6],
    ...[
      [26, 270, -20, 254], [38, 286, 12, 262], [44, 300, 14, 300],
      [372, 268, 396, 244], [362, 282, 392, 286], [352, 298, 382, 312],
      [120, 330, 110, 300], [292, 322, 300, 292],
    ].map(([a, b, c, d], i): Entry => [leaf(a, b, c, d, 6), i % 2 ? 14 : 13]),

    // owl: ear tufts, body, wings, head
    [poly([[152, 120], [138, 66], [178, 104]]), 6],
    [poly([[248, 120], [262, 66], [222, 104]]), 6],
    [smooth([[200, 150], [246, 170], [262, 232], [250, 300], [200, 322], [150, 300], [138, 232], [154, 170]]), 5],
    [smooth([[200, 190], [232, 205], [242, 250], [230, 294], [200, 308], [170, 294], [158, 250], [168, 205]]), 7],
    ...[
      [186, 212], [214, 212],
      [172, 236], [200, 236], [228, 236],
      [176, 260], [200, 260], [224, 260],
      [188, 284], [212, 284],
    ].map(([x, y]): Entry => [chevron(x, y), 6]),
    ...both([[156, 178], [134, 214], [130, 266], [150, 306], [172, 300], [164, 238]], 6),
    ...both([[148, 222], [140, 258], [150, 292], [158, 260]], 5),
    [smooth([[200, 96], [240, 104], [264, 138], [252, 176], [200, 188], [148, 176], [136, 138], [160, 104]]), 5],
    [circle(178, 142, 29), 8],
    [circle(222, 142, 29), 8],
    ...eye(178),
    ...eye(222),
    [poly([[192, 158], [208, 158], [200, 178]]), 11],
    ...talons(182),
    ...talons(218),

    // fireflies
    ...([[110, 210], [300, 200], [90, 262], [318, 250], [56, 220]] as const).map(([x, y]): Entry => [circle(x, y, 4), 9]),
  ]),
};

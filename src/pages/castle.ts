import type { ColoringPage } from './types';
import { circle, cloud, ellipse, leaf, poly, rect, regions, smooth, star, type Pt } from './shapes';

type Entry = [string, number];

/** Wall/keep outline with merlons (crenellations) along the top. */
const battlement = (x: number, y: number, w: number, h: number, merlons: number, notch: number) => {
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
const arch = (x: number, y: number, w: number, h: number) =>
  `M${x} ${y + h}V${y + w / 2}A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2}V${y + h}Z`;

/** Hanging banner with a notched bottom. */
const banner = (x: number, y: number, w: number, h: number) =>
  poly([[x, y], [x + w, y], [x + w, y + h], [x + w / 2, y + h - 8], [x, y + h]]);

const plus = (cx: number, cy: number, arm: number, t: number) =>
  poly([
    [cx - t, cy - arm], [cx + t, cy - arm], [cx + t, cy - t], [cx + arm, cy - t], [cx + arm, cy + t], [cx + t, cy + t],
    [cx + t, cy + arm], [cx - t, cy + arm], [cx - t, cy + t], [cx - arm, cy + t], [cx - arm, cy - t], [cx - t, cy - t],
  ]);

const tower = (x: number): Entry[] => {
  const cx = x + 23;
  return [
    [rect(x, 140, 46, 155), 5],
    [rect(x, 190, 46, 6), 6],
    [rect(x, 250, 46, 6), 6],
    [arch(cx - 5, 160, 10, 22), 13],
    [arch(cx - 5, 210, 10, 22), 13],
    [rect(cx - 1, 52, 2.5, 30), 15],
    [poly([[cx + 1.5, 53], [cx + 22, 60], [cx + 1.5, 67]]), 8],
    [poly([[x - 6, 142], [cx, 80], [x + 52, 142]]), 7],
    [rect(x - 6, 138, 58, 7), 9],
    [circle(cx, 79, 4.5), 9],
  ];
};

export const castle: ColoringPage = {
  id: 'castle',
  title: "Knight's Castle",
  viewBox: '0 0 400 400',
  palette: [
    { hex: '#93c5fd', name: 'Sky' },
    { hex: '#f8fafc', name: 'Cloud' },
    { hex: '#4ade80', name: 'Grass' },
    { hex: '#15803d', name: 'Hills' },
    { hex: '#e7dcc8', name: 'Light Stone' },
    { hex: '#a8977a', name: 'Dark Stone' },
    { hex: '#7c3aed', name: 'Royal Purple' },
    { hex: '#dc2626', name: 'Red' },
    { hex: '#facc15', name: 'Gold' },
    { hex: '#92400e', name: 'Wood' },
    { hex: '#2563eb', name: 'Moat' },
    { hex: '#cbd5e1', name: 'Steel' },
    { hex: '#1e293b', name: 'Shadow' },
    { hex: '#f5d69b', name: 'Sand' },
    { hex: '#64748b', name: 'Iron' },
  ],
  regions: regions([
    // sky and landscape
    [rect(0, 0, 400, 400), 1],
    [circle(355, 45, 24), 9],
    [cloud(18, 72, 92), 2],
    [cloud(205, 46, 78), 2],
    ['M0 250Q90 205 190 240T400 225V400H0Z', 4],
    ['M0 282Q200 268 400 282V400H0Z', 3],

    // castle: keep behind the curtain wall
    [battlement(120, 95, 90, 160, 4, 10), 6],
    [arch(138, 122, 13, 24), 13],
    [arch(179, 122, 13, 24), 13],
    [circle(165, 168, 12), 8],
    [circle(165, 168, 5.5), 9],
    [rect(163.8, 55, 2.5, 42), 15],
    [poly([[166.3, 57], [192, 64], [166.3, 72]]), 8],

    // towers
    ...tower(40),
    ...tower(244),

    // curtain wall, bricks and banners
    [battlement(86, 185, 158, 105, 6, 10), 5],
    [rect(96, 252, 18, 8), 6],
    [rect(214, 262, 18, 8), 6],
    [rect(206, 240, 18, 8), 6],
    [rect(104, 272, 18, 8), 6],
    [banner(98, 205, 18, 38), 7],
    [circle(107, 219, 5), 9],
    [banner(214, 205, 18, 38), 7],
    [circle(223, 219, 5), 9],

    // gate with portcullis
    [arch(140, 222, 50, 68), 6],
    [arch(148, 230, 34, 60), 13],
    [rect(155.5, 240, 3, 50), 15],
    [rect(163.5, 232, 3, 58), 15],
    [rect(171.5, 240, 3, 50), 15],
    [rect(148, 262, 34, 3), 15],

    // moat, drawbridge, path
    ['M0 296Q100 288 200 296T400 296V326Q300 334 200 326T0 326Z', 11],
    [leaf(30, 311, 62, 311, 3.5), 2],
    [leaf(225, 313, 258, 313, 3.5), 2],
    [leaf(80, 320, 104, 320, 3), 2],
    [poly([[140, 290], [190, 290], [202, 336], [128, 336]]), 10],
    [poly([[132, 318], [198, 318], [199.5, 323], [130.5, 323]]), 6],
    [poly([[141, 236], [144, 236], [131, 334], [128, 334]]), 15],
    [poly([[186, 236], [189, 236], [202, 334], [199, 334]]), 15],
    [poly([[128, 336], [202, 336], [236, 400], [96, 400]]), 14],

    // foreground garden
    [ellipse(42, 356, 32, 18), 4],
    [ellipse(84, 374, 20, 12), 4],
    [circle(22, 386, 6), 8],
    [circle(44, 391, 6), 9],
    [circle(66, 386, 6), 8],
    [circle(14, 362, 5), 9],
    [smooth([[238, 392], [244, 377], [258, 374], [266, 386], [258, 395]]), 6],

    // knight: lance behind everything
    [poly([[349, 330], [355, 330], [381, 120], [375, 120]]), 10],
    [poly([[372, 124], [384, 124], [378, 96]]), 15],
    [poly([[380, 128], [400, 136], [380, 144]]), 8],
    // legs and boots
    [rect(306, 320, 11, 50), 12],
    [rect(323, 320, 11, 50), 12],
    [rect(301, 367, 18, 15), 15],
    [rect(321, 367, 18, 15), 15],
    // body
    [poly([[298, 262], [342, 262], [338, 322], [302, 322]]), 12],
    [poly([[306, 268], [334, 268], [332, 332], [308, 332]]), 8],
    [plus(320, 288, 9, 3), 9],
    [rect(301, 310, 38, 8), 10],
    [rect(316, 309, 8, 10), 9],
    [poly([[336, 268], [349, 271], [355, 305], [342, 307]]), 12],
    [circle(350, 307, 7), 15],
    [circle(299, 268, 9), 15],
    [circle(341, 268, 9), 15],
    // helmet and plume
    ['M305 263V232Q305 212 320 212Q335 212 335 232V263Z', 12],
    [rect(309, 232, 22, 5), 13],
    [rect(318.5, 239, 3, 16), 13],
    [smooth([[318, 215], [311, 197], [323, 184], [345, 187], [339, 199], [327, 203], [325, 214]]), 8],
    // shield: gold rim, quartered field, star
    ['M266 268H302V298Q302 326 284 340Q266 326 266 298Z', 9],
    ['M271 273H284V333Q271 322 271 298Z', 7],
    ['M284 273H297V298Q297 322 284 333Z', 8],
    [star(284, 296, 9, 4), 9],
  ]),
};

import type { ColoringPage } from './types';
import { circle, cloud, ellipse, leaf, poly, rect, regions, smooth, type Pt } from './shapes';
import { bar, type Entry } from './medieval';

/** Color numbers, named so the drawing below reads like a recipe. */
const K = {
  sky: 1, glow: 2, sun: 3, white: 4, peach: 5, red: 6, orange: 7, gold: 8, bark: 9, grass: 10,
  grassDark: 11, path: 12, pathShade: 13, wood: 14, coat: 15, charcoal: 16, silver: 17, snow: 18,
  black: 19, collar: 20, stem: 21, lamp: 22,
} as const;

const lock = (a: Pt, b: Pt, w: number, color: number): Entry => [leaf(a[0], a[1], b[0], b[1], w), color];

/** Small maple-ish leaf at (x, y), rotated by `deg`. */
const fallenLeaf = (x: number, y: number, deg: number, color: number, size = 7): Entry => {
  const a = (deg * Math.PI) / 180;
  return [leaf(x - Math.cos(a) * size, y - Math.sin(a) * size, x + Math.cos(a) * size, y + Math.sin(a) * size, size * 0.42), color];
};

// ---------- background ----------

const autumnTree = (x: number, base: number, r: number, colors: number[]): Entry[] => [
  [poly([[x - r * 0.16, base], [x - r * 0.1, base - r * 1.6], [x + r * 0.1, base - r * 1.6], [x + r * 0.16, base]]), K.bark],
  ...([[-0.6, -1.9, 0.6], [0.6, -2, 0.6], [0, -2.4, 0.7], [-0.55, -2.5, 0.45], [0.6, -2.6, 0.42], [-0.25, -1.75, 0.5], [0.3, -1.65, 0.45]] as const).map(
    ([dx, dy, k], i): Entry => [circle(x + dx * r, base + dy * r, k * r), colors[i % colors.length]],
  ),
];

const lampPost = (x: number, ground: number): Entry[] => [
  [rect(x - 3, ground - 150, 6, 150), K.charcoal],
  [rect(x - 9, ground - 8, 18, 8), K.charcoal],
  [poly([[x - 14, ground - 152], [x + 14, ground - 152], [x + 9, ground - 176], [x - 9, ground - 176]]), K.lamp],
  [poly([[x - 17, ground - 176], [x + 17, ground - 176], [x, ground - 190]]), K.charcoal],
  [rect(x - 16, ground - 154, 32, 5), K.charcoal],
];

const pumpkin = (x: number, y: number, w: number): Entry[] => [
  [ellipse(x - w * 0.28, y, w * 0.32, w * 0.36), K.orange],
  [ellipse(x + w * 0.28, y, w * 0.32, w * 0.36), K.orange],
  [ellipse(x, y, w * 0.3, w * 0.38), K.gold],
  [bar([x, y - w * 0.34], [x + w * 0.08, y - w * 0.56], w * 0.1), K.stem],
  [leaf(x + w * 0.04, y - w * 0.4, x + w * 0.36, y - w * 0.52, w * 0.07), K.stem],
];

const bird = (x: number, y: number): Entry =>
  [`M${x - 9} ${y}Q${x - 4} ${y - 6} ${x} ${y}Q${x + 4} ${y - 6} ${x + 9} ${y}Q${x + 4} ${y - 2.5} ${x} ${y + 2.5}Q${x - 4} ${y - 2.5} ${x - 9} ${y}Z`, K.charcoal];

// ---------- the schnauzer (profile, facing right, paws on y = 352) ----------

const farLegs = (): Entry[] => [
  // far hind leg and far front leg sit in shadow
  [smooth([[150, 266], [170, 276], [150, 306], [154, 344], [136, 346], [132, 306]]), K.charcoal],
  [smooth([[224, 262], [244, 262], [246, 304], [244, 344], [226, 346], [224, 304]]), K.charcoal],
  [ellipse(146, 348, 13, 5.5), K.coat],
  [ellipse(238, 348, 13, 5.5), K.coat],
];

const tail = (): Entry[] => [
  lock([118, 210], [108, 168], 6, K.charcoal),
  lock([114, 196], [108, 174], 2.6, K.coat),
];

const body = (): Entry[] => [
  [smooth([[116, 208], [150, 198], [200, 196], [244, 192], [270, 208], [282, 240], [272, 272], [240, 282], [200, 278], [160, 276], [122, 270], [104, 240]]), K.coat],
  // dark saddle along the back
  [smooth([[118, 208], [160, 199], [220, 196], [250, 196], [248, 214], [210, 224], [160, 226], [124, 230]]), K.charcoal],
  // fringe hanging under the belly
  ...[156, 168, 180, 192, 204, 216, 228].map((x, i): Entry => lock([x, 270], [x - 3, 290], 4, i % 2 ? K.snow : K.silver)),
];

const nearHindLeg = (): Entry[] => [
  [smooth([[104, 214], [148, 220], [162, 254], [150, 282], [118, 284], [100, 250]]), K.coat],
  [smooth([[128, 266], [152, 274], [134, 306], [138, 344], [118, 346], [114, 306]]), K.coat],
  [smooth([[116, 306], [134, 304], [140, 342], [118, 344]]), K.silver],
  lock([116, 296], [102, 318], 4, K.silver),
  lock([118, 318], [104, 338], 4, K.snow),
  [ellipse(128, 350, 15, 6), K.silver],
  ...[120, 129, 138].map((x): Entry => [circle(x, 351, 3.6), K.snow]),
];

const neckAndHead = (): Entry[] => [
  [smooth([[232, 206], [248, 176], [264, 152], [292, 156], [300, 186], [288, 222], [264, 236]]), K.coat],
  [smooth([[250, 178], [266, 156], [276, 176], [266, 206], [248, 204]]), K.charcoal],
  // chest furnishings
  [smooth([[264, 214], [286, 220], [292, 250], [282, 284], [262, 288], [262, 250]]), K.silver],
  lock([278, 236], [296, 262], 4, K.snow),
  lock([280, 260], [292, 290], 4, K.snow),
  // collar with a round tag
  [bar([250, 190], [294, 200], 10), K.collar],
  [bar([288, 204], [290, 214], 2.6), K.gold],
  [circle(291, 220, 7), K.gold],
  ...head(),
];

/** Long, blocky head with a folded ear, bushy brow, mustache and a full beard. */
const head = (): Entry[] => [
  [smooth([[262, 150], [272, 134], [296, 128], [322, 132], [348, 138], [364, 144], [366, 158], [358, 168], [326, 172], [296, 176], [270, 172]]), K.coat],
  [smooth([[270, 140], [294, 130], [318, 134], [316, 144], [292, 146], [276, 152]]), K.charcoal],
  // folded V ear
  [poly([[270, 138], [292, 124], [302, 152], [284, 146]]), K.charcoal],
  [poly([[280, 137], [292, 130], [296, 145]]), K.coat],
  // beard hanging below the muzzle
  [smooth([[300, 170], [330, 164], [362, 166], [372, 180], [364, 204], [346, 220], [326, 222], [310, 206], [300, 186]]), K.silver],
  ...([[316, 204, 310, 234], [330, 214, 328, 242], [346, 212, 352, 238], [362, 198, 374, 222]] as const).map(
    ([a, b, c, d], i): Entry => lock([a, b], [c, d], 5.5, i % 2 ? K.silver : K.snow),
  ),
  lock([326, 180], [344, 208], 3.6, K.snow),
  [smooth([[322, 158], [350, 150], [372, 158], [368, 172], [340, 176]]), K.snow],
  // eye under a bushy brow
  [ellipse(312, 157, 5.2, 4.4), K.black],
  [circle(314, 155.5, 2.1), K.white],
  [smooth([[292, 144], [312, 135], [336, 138], [348, 147], [326, 146], [302, 151]]), K.silver],
  lock([306, 139], [342, 130], 3, K.snow),
  lock([316, 143], [350, 144], 2.6, K.snow),
  // nose
  [ellipse(367, 151, 8, 6.5), K.black],
  [ellipse(364, 148.5, 3.8, 2.2), K.coat],
];

const nearFrontLeg = (): Entry[] => [
  [smooth([[246, 262], [270, 262], [272, 304], [270, 344], [248, 346], [244, 304]]), K.coat],
  [smooth([[250, 280], [270, 282], [272, 340], [250, 342], [246, 310]]), K.silver],
  lock([246, 292], [236, 316], 4, K.snow),
  lock([246, 316], [238, 338], 4, K.silver),
  [ellipse(262, 350, 15, 6), K.silver],
  ...[254, 263, 272].map((x): Entry => [circle(x, 351, 3.6), K.snow]),
];

export const schnauzer: ColoringPage = {
  id: 'schnauzer',
  title: 'Schnauzer in the Park',
  viewBox: '0 0 400 400',
  palette: [
    { hex: '#dbeafe', name: 'Sky' },
    { hex: '#fef3c7', name: 'Evening Glow' },
    { hex: '#fcd34d', name: 'Sun' },
    { hex: '#ffffff', name: 'White' },
    { hex: '#fdba74', name: 'Peach' },
    { hex: '#dc2626', name: 'Maple Red' },
    { hex: '#f97316', name: 'Orange' },
    { hex: '#facc15', name: 'Gold' },
    { hex: '#78350f', name: 'Bark' },
    { hex: '#a3b14b', name: 'Olive Grass' },
    { hex: '#65712a', name: 'Moss' },
    { hex: '#e7d3a8', name: 'Path' },
    { hex: '#c8ad7f', name: 'Path Shade' },
    { hex: '#a16207', name: 'Bench Wood' },
    { hex: '#6b7280', name: 'Pepper Gray' },
    { hex: '#374151', name: 'Charcoal' },
    { hex: '#d1d5db', name: 'Silver' },
    { hex: '#f3f4f6', name: 'Snow' },
    { hex: '#111827', name: 'Black' },
    { hex: '#0d9488', name: 'Teal Collar' },
    { hex: '#4d7c0f', name: 'Stem Green' },
    { hex: '#fef08a', name: 'Lamp Light' },
  ],
  regions: regions([
    // sky, low sun, clouds, birds
    [rect(0, 0, 400, 400), K.sky],
    ['M0 170Q200 150 400 170V260H0Z', K.glow],
    [circle(170, 150, 24), K.sun],
    [cloud(30, 70, 90), K.white],
    [cloud(190, 48, 70), K.white],
    bird(120, 112),
    bird(146, 100),
    bird(250, 96),

    // distant tree line
    ...([[10, 22], [44, 26], [80, 20], [190, 24], [228, 20], [366, 26], [398, 22]] as const).map(
      ([x, r], i): Entry => [circle(x, 214 - r * 0.4, r), [K.peach, K.orange, K.gold][i % 3]],
    ),
    ['M0 214Q200 200 400 214V400H0Z', K.grass],

    // winding path toward the horizon
    ['M168 212Q182 212 196 212Q230 250 214 290Q196 340 260 400H90Q140 340 160 290Q178 250 168 212Z', K.path],
    ['M180 212H190Q214 250 200 290Q184 340 226 400H200Q160 340 176 290Q194 250 180 212Z', K.pathShade],

    // big trees, bench, lamp post
    ...autumnTree(56, 260, 40, [K.red, K.orange, K.gold, K.orange, K.red]),
    ...lampPost(390, 300),
    
    // shadow under the dog and grass tufts
    [ellipse(200, 352, 120, 10), K.grassDark],

    // the dog (back to front)
    ...farLegs(),
    ...tail(),
    ...body(),
    ...nearHindLeg(),
    ...neckAndHead(),
    ...nearFrontLeg(),

    // pumpkins and grass in the foreground
    ...pumpkin(46, 356, 40),
    ...pumpkin(98, 370, 30),
    ...([[16, 398], [140, 398], [292, 340], [330, 398], [392, 360], [240, 398]] as const).flatMap(([x, y]) =>
      [[-7, -14], [0, -18], [7, -13]].map(([dx, dy]): Entry => [leaf(x, y, x + dx, y + dy, 1.8), K.grassDark]),
    ),

    // a stick to fetch
    [bar([300, 372], [372, 360], 7), K.bark],
    [bar([348, 364], [358, 348], 4), K.bark],

    // fallen leaves on the ground and in the air
    ...([
      [24, 300, 20, K.red], [60, 318, -30, K.orange], [34, 304, 60, K.gold], [200, 330, 10, K.red], [140, 372, -50, K.orange],
      [70, 330, 80, K.gold], [160, 392, -30, K.gold], [260, 370, 20, K.orange], [376, 330, 30, K.gold], [182, 384, 30, K.red], [284, 386, -20, K.gold], [330, 330, 45, K.orange], [380, 386, -60, K.red],
      [302, 304, 70, K.gold], [12, 384, -10, K.orange], [116, 300, 40, K.gold],
    ] as const).map(([x, y, d, c]) => fallenLeaf(x, y, d, c)),
    ...([[110, 150, 30, K.orange], [128, 196, -40, K.red], [250, 70, 60, K.gold], [214, 168, -20, K.red], [384, 196, 50, K.orange]] as const).map(
      ([x, y, d, c]) => fallenLeaf(x, y, d, c, 6),
    ),
  ]),
};

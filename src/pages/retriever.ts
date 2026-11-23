import type { ColoringPage } from './types';
import { circle, cloud, ellipse, leaf, petal, poly, rect, regions, smooth, star, type Pt } from './shapes';
import { bar, type Entry } from './medieval';

/** Color numbers, named so the drawing below reads like a recipe. */
const K = {
  sky: 1, white: 2, sun: 3, orange: 4, farHill: 5, hill: 6, lawn: 7, deepGreen: 8, bark: 9, red: 10,
  fenceShade: 11, golden: 12, honey: 13, cream: 14, amber: 15, eye: 16, black: 17, mouth: 18,
  tongue: 19, rose: 20, collar: 21, purple: 22, lawnLight: 23,
} as const;

const AXIS = 200;

/** Closed shape symmetric about x = 200: give the right half from top-center to bottom-center. */
const sym = (right: Pt[]): string => {
  const left = right.slice(1, -1).reverse().map(([x, y]): Pt => [2 * AXIS - x, y]);
  return smooth([...right, ...left]);
};

const mirror = (pts: Pt[]): Pt[] => pts.map(([x, y]): Pt => [2 * AXIS - x, y]);

/** The same entry on both sides of the dog. */
const pair = (make: (m: (p: Pt[]) => Pt[], s: 1 | -1) => Entry[]): Entry[] => [
  ...make((p) => p, 1),
  ...make(mirror, -1),
];

/** Fur lock: a pointed tuft from base to tip. */
const lock = (a: Pt, b: Pt, w: number, color: number): Entry => [leaf(a[0], a[1], b[0], b[1], w), color];

// ---------- background pieces ----------

const sunRays = (cx: number, cy: number): Entry[] =>
  Array.from({ length: 12 }, (_, i): Entry => {
    const a = (i * Math.PI) / 6;
    const at = (r: number, da = 0): Pt => [cx + Math.cos(a + da) * r, cy + Math.sin(a + da) * r];
    return [poly([at(32, -0.13), at(46), at(32, 0.13)]), i % 2 ? K.orange : K.sun];
  });

const appleTree = (): Entry[] => [
  [poly([[336, 300], [346, 196], [358, 196], [366, 300]]), K.bark],
  [bar([350, 236], [316, 196], 7), K.bark],
  [bar([354, 224], [388, 186], 7), K.bark],
  ...([[330, 150, 34], [372, 140, 32], [352, 112, 32], [306, 186, 24], [392, 186, 24], [350, 172, 30]] as const).map(
    ([x, y, r], i): Entry => [circle(x, y, r), i % 2 ? K.deepGreen : K.hill],
  ),
  ...([[318, 140], [342, 104], [372, 124], [388, 160], [330, 182], [362, 182], [300, 196], [396, 200], [352, 146]] as const).map(
    ([x, y]): Entry => [circle(x, y, 5.5), K.red],
  ),
  ...([[344, 104], [374, 124], [354, 146]] as const).map(([x, y]): Entry => [leaf(x, y - 5, x + 6, y - 12, 1.8), K.hill]),
];

/** Picket fence with pointed tops, running behind the dog. */
const fence = (): Entry[] => {
  const out: Entry[] = [
    [rect(0, 236, 400, 8), K.fenceShade],
    [rect(0, 268, 400, 8), K.fenceShade],
  ];
  for (let x = 6; x < 390; x += 24) {
    if (x > 110 && x < 270) continue; // hidden behind the dog
    out.push([poly([[x, 290], [x, 222], [x + 8, 210], [x + 16, 222], [x + 16, 290]]), K.white]);
    out.push([rect(x + 11, 224, 5, 66), K.fenceShade]);
  }
  return out;
};

const bush = (x: number, y: number, w: number, flowerColor: number): Entry[] => [
  [cloud(x, y, w), K.deepGreen],
  [cloud(x + w * 0.12, y, w * 0.6), K.hill],
  ...[0.22, 0.48, 0.74].map((t, i): Entry => [circle(x + w * t, y - w * (0.18 + (i % 2) * 0.1), 4.5), flowerColor]),
];

const daisy = (x: number, y: number, r: number, petals = 8): Entry[] => [
  [leaf(x, y + r * 3.4, x + r * 0.4, y + r, r * 0.22), K.deepGreen],
  [leaf(x, y + r * 3, x + r * 1.8, y + r * 2.2, r * 0.35), K.hill],
  ...Array.from({ length: petals }, (_, i): Entry => [petal(x, y, r * 1.6, r * 0.32, (i * 360) / petals - 90), K.white]),
  [circle(x, y, r * 0.55), K.sun],
];

const tulip = (x: number, y: number, color: number): Entry[] => [
  [bar([x, y + 30], [x, y + 6], 2.4), K.deepGreen],
  [leaf(x, y + 32, x - 12, y + 12, 3), K.hill],
  [smooth([[x - 9, y - 10], [x - 4, y - 2], [x, y - 12], [x + 4, y - 2], [x + 9, y - 10], [x + 8, y + 4], [x, y + 9], [x - 8, y + 4]]), color],
  [leaf(x, y + 8, x, y - 9, 3.2), K.rose],
];

const grassTuft = (x: number, y: number, color: number): Entry[] =>
  [[-7, -14], [0, -18], [7, -13]].map(([dx, dy]): Entry => [leaf(x, y, x + dx, y + dy, 1.6), color]);

const butterfly = (x: number, y: number): Entry[] => [
  [smooth([[x - 2, y - 2], [x - 16, y - 16], [x - 24, y - 8], [x - 18, y + 2]]), K.orange],
  [smooth([[x + 2, y - 2], [x + 16, y - 16], [x + 24, y - 8], [x + 18, y + 2]]), K.orange],
  [smooth([[x - 2, y + 1], [x - 14, y + 4], [x - 14, y + 14], [x - 5, y + 10]]), K.purple],
  [smooth([[x + 2, y + 1], [x + 14, y + 4], [x + 14, y + 14], [x + 5, y + 10]]), K.purple],
  [circle(x - 16, y - 9, 3.4), K.black],
  [circle(x + 16, y - 9, 3.4), K.black],
  [ellipse(x, y, 2.4, 10), K.black],
  [bar([x - 1, y - 9], [x - 6, y - 18], 2.4), K.black],
  [bar([x + 1, y - 9], [x + 6, y - 18], 2.4), K.black],
];

/** Tennis-style ball with two curved seams. */
const ball = (x: number, y: number, r: number): Entry[] => [
  [circle(x, y, r), K.red],
  [`M${x - r * 0.92} ${y - r * 0.38}Q${x} ${y + r * 0.1} ${x + r * 0.92} ${y - r * 0.38}L${x + r * 0.97} ${y - r * 0.18}Q${x} ${y + r * 0.34} ${x - r * 0.97} ${y - r * 0.18}Z`, K.white],
  [ellipse(x - r * 0.4, y - r * 0.6, r * 0.22, r * 0.12, -30), K.white],
];

const bone = (x: number, y: number): Entry[] => [
  [rect(x - 14, y - 3.5, 28, 7), K.cream],
  [circle(x - 15, y - 4, 5), K.cream],
  [circle(x - 15, y + 4, 5), K.cream],
  [circle(x + 15, y - 4, 5), K.cream],
  [circle(x + 15, y + 4, 5), K.cream],
];

// ---------- the dog ----------

/** Tail: a feathery plume sweeping out to the right along the grass. */
const tail = (): Entry[] => [
  [smooth([[262, 336], [300, 322], [338, 306], [364, 290], [372, 302], [352, 330], [314, 352], [272, 360]]), K.golden],
  lock([300, 340], [326, 362], 5, K.amber),
  lock([322, 330], [350, 348], 5, K.amber),
  lock([342, 318], [370, 330], 4.5, K.amber),
  lock([356, 302], [384, 300], 4, K.honey),
  lock([300, 330], [350, 312], 3, K.honey),
];

const haunches = (): Entry[] =>
  pair((m) => [
    [smooth(m([[256, 280], [296, 288], [318, 320], [316, 352], [292, 366], [256, 360], [244, 320]])), K.amber],
    [smooth(m([[264, 296], [292, 302], [304, 326], [296, 346], [272, 348], [262, 322]])), K.golden],
    lock(m([[300, 296]])[0], m([[316, 288]])[0], 3, K.amber),
    [ellipse(m([[304, 370]])[0][0], 370, 22, 9), K.honey],
    ...[294, 304, 314].map((tx): Entry => [circle(m([[tx, 0]])[0][0], 372, 4.4), K.cream]),
  ]);

const torso = (): Entry[] => [
  [sym([[200, 178], [236, 184], [262, 214], [276, 262], [284, 318], [282, 356], [252, 368], [200, 370]]), K.golden],
  // shading down the flanks
  ...pair((m) => [[smooth(m([[262, 224], [274, 262], [276, 296], [268, 306], [262, 268], [256, 236]])), K.amber]]),
];

/** The fluffy chest ruff: a cream bib covered in layered locks. */
const ruff = (): Entry[] => {
  const out: Entry[] = [
    [sym([[200, 192], [234, 198], [252, 228], [248, 270], [230, 302], [200, 316]]), K.honey],
  ];
  const rows: { y: number; half: number; count: number }[] = [
    { y: 212, half: 40, count: 6 },
    { y: 236, half: 44, count: 7 },
  ];
  rows.forEach(({ y, half, count }, ri) => {
    for (let i = 0; i < count; i++) {
      const x = AXIS - half + ((2 * half) / (count - 1)) * i;
      const lean = (x - AXIS) * 0.12;
      out.push(lock([x, y], [x + lean, y + 24], 5.2, (i + ri) % 2 ? K.cream : K.honey));
    }
  });
  out.push(lock([200, 258], [200, 284], 5.2, K.cream));
  out.push(lock([200, 284], [200, 318], 5.4, K.honey));
  return out;
};

const collar = (): Entry[] => [
  ['M158 194Q200 222 242 194L244 206Q200 236 156 206Z', K.collar],
  [bar([226, 212], [228, 222], 2.4), K.sun],
  [circle(229, 230, 9), K.sun],
  [star(229, 230, 5.2, 2.4), K.orange],
];

const frontLegs = (): Entry[] =>
  pair((m) => [
    [smooth(m([[214, 262], [240, 262], [244, 300], [242, 348], [214, 350], [210, 300]])), K.golden],
    [smooth(m([[234, 270], [242, 290], [242, 334], [234, 340], [232, 300]])), K.amber],
    lock(m([[242, 282]])[0], m([[258, 302]])[0], 3.6, K.amber),
    lock(m([[243, 298]])[0], m([[258, 318]])[0], 3.6, K.honey),
    lock(m([[243, 314]])[0], m([[256, 334]])[0], 3.4, K.amber),
    [smooth(m([[208, 344], [246, 344], [252, 360], [248, 374], [206, 374], [202, 360]])), K.honey],
    ...[212, 224, 236, 247].map((tx): Entry => [ellipse(m([[tx, 0]])[0][0], 371, 5.6, 4.4), K.cream]),
  ]);

const ears = (): Entry[] =>
  pair((m) => [
    [smooth(m([[242, 92], [266, 98], [280, 128], [286, 168], [282, 204], [268, 222], [250, 214], [244, 186], [248, 150], [244, 118]])), K.amber],
    [smooth(m([[252, 112], [266, 124], [272, 160], [270, 194], [260, 204], [256, 170], [256, 138]])), K.golden],
    lock(m([[262, 134]])[0], m([[268, 186]])[0], 2.6, K.honey),
    lock(m([[254, 212]])[0], m([[250, 236]])[0], 4.6, K.amber),
    lock(m([[266, 214]])[0], m([[270, 238]])[0], 4.6, K.golden),
    lock(m([[278, 204]])[0], m([[292, 226]])[0], 4.2, K.amber),
  ]);

const head = (): Entry[] => [
  [sym([[200, 78], [228, 80], [250, 96], [260, 122], [258, 150], [248, 174], [228, 194], [200, 202]]), K.golden],
  // forehead blaze and cheek highlights
  [sym([[200, 84], [220, 88], [228, 102], [214, 112], [200, 114]]), K.honey],
  ...pair((m) => [
    [smooth(m([[236, 152], [252, 146], [252, 168], [238, 184], [228, 176]])), K.honey],
    // brow patch above each eye
    lock(m([[212, 114]])[0], m([[236, 121]])[0], 3, K.honey),
    // eye: dark almond, pupil, two highlights
    [ellipse(m([[223, 0]])[0][0], 135, 10, 7.6), K.eye],
    [circle(m([[223, 0]])[0][0], 135, 5), K.black],
    [circle(m([[226, 0]])[0][0], 132, 2), K.white],
  ]),
  // muzzle
  [sym([[200, 146], [220, 150], [234, 166], [234, 184], [222, 198], [200, 204]]), K.cream],
  // open mouth, tongue, jowls
  [sym([[200, 180], [218, 184], [214, 200], [200, 206]]), K.mouth],
  [sym([[200, 186], [212, 190], [214, 210], [210, 228], [200, 236]]), K.tongue],
  [leaf(200, 196, 200, 228, 1.6), K.rose],
  ...pair((m) => [[smooth(m([[200, 176], [216, 176], [230, 184], [228, 196], [214, 194], [204, 186]])), K.cream]]),
  // nose
  [sym([[200, 150], [214, 152], [220, 162], [212, 172], [200, 176]]), K.black],
  [ellipse(195, 157, 4.6, 2.2, -10), K.fenceShade],
];

export const retriever: ColoringPage = {
  id: 'retriever',
  title: 'Golden Retriever',
  viewBox: '0 0 400 400',
  palette: [
    { hex: '#bae6fd', name: 'Sky' },
    { hex: '#ffffff', name: 'White' },
    { hex: '#fde047', name: 'Sunshine' },
    { hex: '#fb923c', name: 'Orange' },
    { hex: '#bbf7d0', name: 'Far Hills' },
    { hex: '#4ade80', name: 'Leaf Green' },
    { hex: '#22c55e', name: 'Lawn' },
    { hex: '#15803d', name: 'Deep Green' },
    { hex: '#7c2d12', name: 'Bark' },
    { hex: '#dc2626', name: 'Apple Red' },
    { hex: '#cbd5e1', name: 'Fence Shadow' },
    { hex: '#e3a03e', name: 'Golden' },
    { hex: '#f6cd7f', name: 'Honey' },
    { hex: '#fdebc8', name: 'Cream' },
    { hex: '#b36a1c', name: 'Amber' },
    { hex: '#5b3413', name: 'Eye Brown' },
    { hex: '#1c1917', name: 'Black' },
    { hex: '#7f1d1d', name: 'Mouth' },
    { hex: '#f9a8d4', name: 'Tongue Pink' },
    { hex: '#db2777', name: 'Rose' },
    { hex: '#2563eb', name: 'Collar Blue' },
    { hex: '#a78bfa', name: 'Lavender' },
    { hex: '#86efac', name: 'Light Lawn' },
  ],
  regions: regions([
    // sky, sun, clouds
    [rect(0, 0, 400, 400), K.sky],
    ...sunRays(52, 52),
    [circle(52, 52, 26), K.sun],
    [circle(46, 46, 8), K.white],
    [cloud(110, 70, 84), K.white],
    [cloud(214, 46, 66), K.white],
    [cloud(330, 34, 56), K.white],

    // rolling hills
    ['M0 216Q70 170 150 196T300 178T400 190V300H0Z', K.farHill],
    ['M0 236Q90 206 190 226T400 218V300H0Z', K.hill],
    ...appleTree(),

    // fence and flower bed
    ...fence(),
    ...bush(-10, 296, 70, K.rose),
    ...bush(58, 292, 64, K.purple),
    ...bush(330, 298, 76, K.orange),

    // lawn with mowing stripes
    ['M0 288Q200 276 400 288V400H0Z', K.lawn],
    ['M0 318Q200 304 400 316V336Q200 326 0 340Z', K.lawnLight],
    ['M0 362Q200 350 400 360V378Q200 370 0 382Z', K.lawnLight],

    // the dog (back to front)
    ...tail(),
    ...haunches(),
    ...torso(),
    ...ruff(),
    ...collar(),
    ...frontLegs(),
    ...head(),
    ...ears(),

    // garden details in front
    ...daisy(34, 326, 6),
    ...daisy(70, 352, 5),
    ...daisy(362, 360, 6),
    ...tulip(110, 318, K.red),
    ...tulip(128, 330, K.purple),
    ...tulip(380, 318, K.rose),
    ...ball(44, 384, 14),
    ...bone(330, 388),
    ...grassTuft(14, 398, K.deepGreen),
    ...grassTuft(150, 398, K.deepGreen),
    ...grassTuft(268, 398, K.deepGreen),
    ...grassTuft(390, 398, K.deepGreen),
    ...grassTuft(52, 300, K.lawnLight),
    ...grassTuft(300, 302, K.lawnLight),
    ...butterfly(92, 166),
    ...butterfly(300, 70),
  ]),
};

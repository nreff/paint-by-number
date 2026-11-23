import type { ColoringPage } from './types';
import { circle, cloud, ellipse, leaf, poly, rect, regions, smooth, type Pt } from './shapes';
import { bar, type Entry } from './medieval';

const K = {
  sky: 1, white: 2, lawn: 3, hedge: 4, rose: 5, pink: 6, lavender: 7, purple: 8, blonde: 9, blondeDark: 10,
  skin: 11, cheek: 12, eye: 13, ribbon: 14, ribbonDark: 15, black: 16, teddy: 17, teddyLight: 18, cream: 19,
  gold: 20, mint: 21, red: 22, houseBlue: 23, roof: 24,
} as const;

const GX = 140; // the girl's center line

/** Shape symmetric about x = GX: right half from top-center to bottom-center. */
const sym = (right: Pt[], axis = GX): string => {
  const left = right.slice(1, -1).reverse().map(([x, y]): Pt => [2 * axis - x, y]);
  return smooth([...right, ...left]);
};

// ---------- background ----------

/** Painted-lady house with a round turret, peeking over the hedge. */
const house = (): Entry[] => [
  [rect(228, 80, 150, 120), K.houseBlue],
  [poly([[218, 84], [303, 30], [388, 84]]), K.roof],
  [poly([[258, 84], [303, 52], [348, 84]]), K.white],
  [circle(303, 70, 9), K.gold],
  [rect(190, 70, 44, 130), K.houseBlue],
  [poly([[184, 72], [212, 16], [240, 72]]), K.roof],
  [circle(212, 16, 3.5), K.gold],
  ...[[198, 92], [198, 140], [252, 104], [292, 104], [336, 104], [252, 148], [336, 148]].flatMap(([x, y]): Entry[] => [
    [rect(x, y, 22, 32), K.white],
    [rect(x + 3, y + 3, 7, 26), K.sky],
    [rect(x + 12, y + 3, 7, 26), K.sky],
  ]),
  [rect(290, 146, 26, 54), K.white],
  [rect(294, 150, 18, 50), K.rose],
  [circle(307, 176, 3), K.gold],
];

/** Bunting strung across the top of the page. */
const bunting = (): Entry[] => {
  const out: Entry[] = [['M0 18Q200 58 400 18V22Q200 62 0 22Z', K.ribbonDark]];
  const colors = [K.pink, K.mint, K.lavender, K.gold, K.ribbon];
  for (let i = 0; i < 12; i++) {
    const x = 10 + i * 34;
    const t = x / 400;
    const y = 18 + 160 * t * (1 - t) * 0.25 * 4 * 0.5 + 2;
    out.push([poly([[x, y], [x + 24, y], [x + 12, y + 24]]), colors[i % colors.length]]);
  }
  return out;
};

const roseBush = (x: number, y: number, w: number, colors: number[]): Entry[] => [
  [cloud(x, y, w), K.hedge],
  ...[0.2, 0.42, 0.64, 0.84].map((t, i): Entry => [circle(x + w * t, y - w * (0.16 + ((i + 1) % 2) * 0.12), 5.5), colors[i % colors.length]]),
  ...[0.31, 0.74].map((t): Entry => [leaf(x + w * t, y - w * 0.08, x + w * t + 9, y - w * 0.18, 2.2), K.mint]),
];

// ---------- the girl ----------

const girl = (): Entry[] => [
  // long curls behind
  [sym([[GX, 86], [170, 96], [176, 140], [180, 186], [168, 200], [GX, 190]]), K.blonde],
  ...[[112, 140], [168, 140]].map(([x, y]): Entry => [circle(x, y, 8), K.blondeDark]),
  // stockings and shoes under the skirt
  [rect(122, 344, 10, 20), K.white],
  [rect(148, 344, 10, 20), K.white],
  [smooth([[118, 362], [134, 362], [136, 372], [112, 372]]), K.black],
  [smooth([[146, 362], [162, 362], [168, 372], [144, 372]]), K.black],
  // skirt with a ruffled hem and a white pinafore over it
  [sym([[GX, 208], [168, 212], [186, 290], [198, 346], [GX, 354]]), K.lavender],
  ...[86, 100, 114, 128, 142, 156, 170, 184, 196].map((x, i): Entry => [circle(x, 348 + (i % 2) * 2, 7.5), K.white]),
  [sym([[GX, 216], [158, 218], [168, 284], [174, 332], [GX, 338]]), K.white],
  ...[116, 130, 144, 158].map((x): Entry => [circle(x + 2, 336, 6.5), K.white]),
  [sym([[GX, 276], [148, 284], [GX, 292]]), K.pink],
  [circle(128, 304, 5), K.pink],
  [circle(152, 304, 5), K.pink],
  // bodice, bib and straps
  [rect(118, 166, 44, 48), K.lavender],
  [rect(126, 176, 28, 38), K.white],
  ...[184, 196].map((y): Entry => [circle(GX, y, 2.8), K.purple]),
  // sash with a bow at the side
  [rect(116, 206, 48, 10), K.ribbon],
  [smooth([[164, 211], [184, 198], [186, 222]]), K.ribbon],
  [leaf(166, 214, 178, 244, 4), K.ribbonDark],
  [circle(165, 211, 5), K.ribbonDark],
  // puffed sleeves and arms
  [circle(116, 174, 15), K.lavender],
  [circle(164, 174, 15), K.lavender],
  [bar([108, 186], [96, 240], 11), K.skin],
  [bar([172, 186], [190, 222], 11), K.skin],
  [circle(96, 244, 6), K.skin],
  [circle(192, 226, 6), K.skin],
  [rect(104, 182, 16, 6), K.white],
  [rect(160, 182, 16, 6), K.white],
  // neck, lace collar
  [rect(133, 150, 14, 18), K.skin],
  ...[124, 134, 146, 156].map((x): Entry => [circle(x, 166, 6), K.white]),
  // face and hair
  [ellipse(GX, 128, 25, 28), K.skin],
  [`M${GX - 26} 130Q${GX - 26} 96 ${GX} 96Q${GX + 26} 96 ${GX + 26} 130Q${GX + 14} 108 ${GX} 112Q${GX - 14} 108 ${GX - 26} 130Z`, K.blonde],
  [leaf(GX - 6, 100, GX - 22, 124, 4), K.blondeDark],
  [leaf(GX + 6, 100, GX + 22, 124, 4), K.blondeDark],
  [ellipse(GX - 10, 130, 3.4, 4.2), K.eye],
  [ellipse(GX + 10, 130, 3.4, 4.2), K.eye],
  [circle(GX - 18, 142, 4.6), K.cheek],
  [circle(GX + 18, 142, 4.6), K.cheek],
  [`M${GX - 8} 145Q${GX} 156 ${GX + 8} 145Q${GX} 150 ${GX - 8} 145Z`, K.red],
  // big hair bow
  [smooth([[GX + 4, 94], [GX + 34, 74], [GX + 38, 100], [GX + 10, 100]]), K.ribbon],
  [smooth([[GX - 4, 94], [GX - 34, 74], [GX - 38, 100], [GX - 10, 100]]), K.ribbon],
  [leaf(GX + 30, 82, GX + 16, 96, 3), K.ribbonDark],
  [leaf(GX - 30, 82, GX - 16, 96, 3), K.ribbonDark],
  [circle(GX, 96, 7), K.ribbonDark],
];

const teddy = (x: number, y: number): Entry[] => [
  [circle(x - 14, y - 46, 7), K.teddy],
  [circle(x + 14, y - 46, 7), K.teddy],
  [circle(x - 14, y - 46, 3.6), K.teddyLight],
  [circle(x + 14, y - 46, 3.6), K.teddyLight],
  [ellipse(x, y, 20, 24), K.teddy],
  [ellipse(x, y + 4, 11, 14), K.teddyLight],
  [ellipse(x - 14, y + 24, 9, 7), K.teddy],
  [ellipse(x + 14, y + 24, 9, 7), K.teddy],
  [circle(x, y - 34, 17), K.teddy],
  [ellipse(x, y - 28, 8, 6), K.teddyLight],
  [ellipse(x, y - 31, 3, 2.2), K.black],
  [circle(x - 7, y - 39, 2.4), K.black],
  [circle(x + 7, y - 39, 2.4), K.black],
  [poly([[x - 9, y - 22], [x, y - 17], [x - 9, y - 12]]), K.mint],
  [poly([[x + 9, y - 22], [x, y - 17], [x + 9, y - 12]]), K.mint],
  [circle(x, y - 17, 3), K.mint],
];

// ---------- tea table ----------

const cup = (x: number, y: number, color: number): Entry[] => [
  [ellipse(x, y + 2, 13, 3.6), K.white],
  [`M${x - 9} ${y - 12}H${x + 9}Q${x + 8} ${y} ${x} ${y}Q${x - 8} ${y} ${x - 9} ${y - 12}Z`, color],
  [`M${x + 8} ${y - 10}A5 5 0 1 1 ${x + 8} ${y - 2}V${y - 4.5}A2.6 2.6 0 1 0 ${x + 8} ${y - 7.5}Z`, color],
  [circle(x, y - 6, 2.4), K.white],
];

const teapot = (x: number, y: number): Entry[] => [
  [`M${x + 18} ${y - 18}Q${x + 34} ${y - 22} ${x + 38} ${y - 34}L${x + 42} ${y - 32}Q${x + 38} ${y - 12} ${x + 18} ${y - 8}Z`, K.pink],
  [`M${x - 20} ${y - 26}A11 11 0 1 0 ${x - 20} ${y - 6}V${y - 11}A6 6 0 1 1 ${x - 20} ${y - 21}Z`, K.pink],
  [ellipse(x, y - 16, 22, 17), K.pink],
  [ellipse(x, y - 31, 13, 4), K.rose],
  [circle(x, y - 37, 3.6), K.gold],
  [rect(x - 22, y - 18, 44, 5), K.gold],
  ...[[-10, -8], [8, -8], [0, -24]].map(([dx, dy]): Entry => [circle(x + dx, y + dy, 3), K.white]),
];

/** Two-tier cake stand with little cakes. */
const cakeStand = (x: number, y: number): Entry[] => [
  [rect(x - 1.5, y - 56, 3, 56), K.gold],
  [ellipse(x, y - 2, 24, 4), K.white],
  [ellipse(x, y - 34, 18, 3.5), K.white],
  [circle(x, y - 60, 3), K.gold],
  ...[-14, 0, 14].flatMap((dx): Entry[] => [
    [rect(x + dx - 6, y - 14, 12, 8), K.cream],
    [`M${x + dx - 7} ${y - 14}Q${x + dx} ${y - 24} ${x + dx + 7} ${y - 14}Z`, dx === 0 ? K.mint : K.pink],
  ]),
  [circle(x, y - 26, 2.6), K.red],
  ...[-8, 8].flatMap((dx): Entry[] => [
    [rect(x + dx - 5, y - 44, 10, 7), K.cream],
    [`M${x + dx - 6} ${y - 44}Q${x + dx} ${y - 53} ${x + dx + 6} ${y - 44}Z`, K.lavender],
  ]),
];

const table = (): Entry[] => [
  [rect(228, 262, 160, 12), K.white],
  [sym([[308, 270], [384, 272], [392, 336], [308, 340]], 308), K.white],
  ...[236, 256, 276, 296, 316, 336, 356, 376].map((x): Entry => [circle(x + 2, 336, 9), K.white]),
  ...[244, 276, 308, 340, 372].map((x): Entry => [circle(x, 300, 5), K.pink]),
  ...[260, 292, 324, 356].map((x): Entry => [circle(x, 318, 4), K.mint]),
  ...teapot(284, 262),
  ...cup(332, 262, K.mint),
  ...cakeStand(364, 262),
  // vase of flowers
  [`M238 262Q232 248 240 238H248Q256 248 250 262Z`, K.houseBlue],
  ...[[236, 226, K.red], [246, 220, K.gold], [254, 230, K.pink]].map(([fx, fy, c]): Entry => [circle(fx, fy, 5), c]),
];

export const teaparty: ColoringPage = {
  id: 'teaparty',
  title: 'Garden Tea Party',
  viewBox: '0 0 400 400',
  palette: [
    { hex: '#bfdbfe', name: 'Sky' },
    { hex: '#ffffff', name: 'White' },
    { hex: '#86efac', name: 'Lawn' },
    { hex: '#15803d', name: 'Hedge' },
    { hex: '#e11d48', name: 'Rose Red' },
    { hex: '#f9a8d4', name: 'Pink' },
    { hex: '#c4b5fd', name: 'Lavender' },
    { hex: '#7c3aed', name: 'Purple' },
    { hex: '#fcd34d', name: 'Blonde' },
    { hex: '#d97706', name: 'Golden Curl' },
    { hex: '#fde2c8', name: 'Skin' },
    { hex: '#fda4af', name: 'Rosy Cheek' },
    { hex: '#1e3a8a', name: 'Eye Blue' },
    { hex: '#38bdf8', name: 'Ribbon Blue' },
    { hex: '#0369a1', name: 'Deep Ribbon' },
    { hex: '#1c1917', name: 'Black' },
    { hex: '#a16207', name: 'Teddy Brown' },
    { hex: '#fde68a', name: 'Teddy Tan' },
    { hex: '#fef3c7', name: 'Cream' },
    { hex: '#eab308', name: 'Gold' },
    { hex: '#99f6e4', name: 'Mint' },
    { hex: '#dc2626', name: 'Red' },
    { hex: '#a5b4fc', name: 'House Blue' },
    { hex: '#9f1239', name: 'Roof' },
  ],
  regions: regions([
    [rect(0, 0, 400, 400), K.sky],
    [cloud(20, 90, 80), K.white],
    [cloud(96, 60, 60), K.white],
    ...house(),
    ...bunting(),
    // hedge and rose bushes along the garden wall
    [rect(0, 196, 400, 30), K.hedge],
    ...roseBush(-14, 222, 80, [K.rose, K.pink]),
    ...roseBush(176, 226, 66, [K.pink, K.white]),
    ['M0 224Q200 214 400 224V400H0Z', K.lawn],
    ...[[24, 260], [16, 304], [210, 288], [40, 380], [216, 392], [380, 384]].map(([x, y]): Entry => [
      leaf(x, y, x + 2, y - 12, 2.2), K.hedge,
    ]),
    ...teddy(66, 330),
    ...girl(),
    ...table(),
    // dropped petals
    ...[[214, 352, K.pink], [226, 372, K.rose], [100, 386, K.pink], [20, 340, K.rose]].map(([x, y, c]): Entry => [leaf(x - 5, y, x + 5, y - 2, 2.6), c]),
  ]),
};

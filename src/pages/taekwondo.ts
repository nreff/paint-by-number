import type { ColoringPage } from './types';
import { circle, ellipse, leaf, poly, rect, regions, smooth, type Pt } from './shapes';
import { bar, type Entry } from './medieval';

const K = {
  wall: 1, wallTrim: 2, wood: 3, woodDark: 4, matRed: 5, matBlue: 6, white: 7, black: 8, skin: 9,
  skinShade: 10, hair: 11, yellow: 12, green: 13, red: 14, blue: 15, gold: 16, bag: 17, steel: 18,
  board: 19, window: 20, brown: 21, cheek: 22, panel: 23,
} as const;

const lock = (a: Pt, b: Pt, w: number, color: number): Entry => [leaf(a[0], a[1], b[0], b[1], w), color];

// ---------- room ----------

/** Belt display rack: one hanging belt per rank color. */
const beltRack = (x: number, y: number): Entry[] => {
  const ranks = [K.white, K.yellow, K.green, K.blue, K.red, K.black];
  const out: Entry[] = [[rect(x, y, 128, 8), K.woodDark]];
  ranks.forEach((c, i) => {
    const bx = x + 8 + i * 20;
    out.push([rect(bx, y + 8, 12, 46), c]);
    out.push([poly([[bx, y + 54], [bx + 5, y + 54], [bx + 3, y + 70], [bx - 3, y + 68]]), c]);
    out.push([poly([[bx + 7, y + 54], [bx + 12, y + 54], [bx + 15, y + 68], [bx + 9, y + 70]]), c]);
  });
  return out;
};

/** Wall clock with hour marks and hands. */
const clock = (x: number, y: number): Entry[] => [
  [circle(x, y, 24), K.woodDark],
  [circle(x, y, 19), K.white],
  ...[0, 90, 180, 270].map((d): Entry => {
    const a = (d * Math.PI) / 180;
    return [circle(x + Math.cos(a) * 14, y + Math.sin(a) * 14, 2.4), K.black];
  }),
  [bar([x, y], [x + 8, y - 6], 3), K.black],
  [bar([x, y], [x - 2, y - 13], 2.4), K.red],
  [circle(x, y, 2.6), K.gold],
];

/**
 * Flag of South Korea (Taegukgi): 3:2 white field, a red-over-blue taegeuk whose
 * dividing S-curve follows the flag's diagonal, and the four trigrams
 * (geon, gam, ri, gon) set square to the diagonals in the corners.
 */
const koreanFlag = (x: number, y: number, w: number): Entry[] => {
  const h = (w * 2) / 3;
  const c: Pt = [x + w / 2, y + h / 2];
  const r = h / 4;
  const th = Math.atan2(h, w);
  const u: Pt = [Math.cos(th), Math.sin(th)]; // toward the bottom-right corner
  const v: Pt = [Math.cos(th), -Math.sin(th)]; // toward the top-right corner
  const at = (o: Pt, rad: number, ang: number): Pt => [o[0] + rad * Math.cos(ang), o[1] + rad * Math.sin(ang)];
  const arc = (o: Pt, rad: number, from: number, to: number): Pt[] =>
    Array.from({ length: 25 }, (_, i) => at(o, rad, from + ((to - from) * i) / 24));
  const m1: Pt = [c[0] - (u[0] * r) / 2, c[1] - (u[1] * r) / 2];
  const m2: Pt = [c[0] + (u[0] * r) / 2, c[1] + (u[1] * r) / 2];
  // Red: over the top from the upper-left end to the lower-right end, then the S back:
  // bulging up into the red near the right, down into the blue near the left.
  const red = [
    ...arc(c, r, th + Math.PI, th + 2 * Math.PI),
    ...arc(m2, r / 2, th, th - Math.PI).slice(1),
    ...arc(m1, r / 2, th, th + Math.PI).slice(1, -1),
  ];

  // Trigram bars: length h/4, thickness h/24, gap h/48, square to their diagonal.
  const len = h / 4;
  const t = h / 24;
  const gap = h / 48;
  const centerDist = r + h / 8 + (3 * t + 2 * gap) / 2;
  const trigram = (dir: Pt, sign: 1 | -1, lines: boolean[]): Entry[] => {
    const d: Pt = [dir[0] * sign, dir[1] * sign];
    const p: Pt = [-d[1], d[0]];
    const out: Entry[] = [];
    lines.forEach((solid, k) => {
      const off = centerDist + (k - 1) * (t + gap);
      const m: Pt = [c[0] + d[0] * off, c[1] + d[1] * off];
      const seg = (a: number, b: number): Entry => [bar([m[0] + p[0] * a, m[1] + p[1] * a], [m[0] + p[0] * b, m[1] + p[1] * b], t), K.black];
      if (solid) out.push(seg(-len / 2, len / 2));
      else out.push(seg(-len / 2, -gap * 1.5), seg(gap * 1.5, len / 2));
    });
    return out;
  };

  return [
    [rect(x, y, w, h), K.white],
    [circle(c[0], c[1], r), K.blue],
    [poly(red), K.red],
    ...trigram(u, -1, [true, true, true]), // geon, top-left
    ...trigram(u, 1, [false, false, false]), // gon, bottom-right
    ...trigram(v, 1, [false, true, false]), // gam, top-right
    ...trigram(v, -1, [true, false, true]), // ri, bottom-left
  ];
};

const punchingBag = (x: number): Entry[] => [
  [rect(x - 1.5, 0, 3, 64), K.steel],
  [poly([[x, 60], [x - 18, 78], [x + 18, 78]]), K.steel],
  [smooth([[x - 22, 80], [x + 22, 80], [x + 24, 150], [x + 22, 218], [x - 22, 218], [x - 24, 150]]), K.bag],
  [rect(x - 24, 104, 48, 10), K.black],
  [rect(x - 24, 186, 48, 10), K.black],
  [ellipse(x - 10, 140, 4, 22), K.red],
];

/** Wooden floor, then a checkerboard of mats laid in rows. */
const floor = (): Entry[] => {
  const out: Entry[] = [[rect(0, 286, 400, 114), K.wood]];
  for (let x = 0; x < 400; x += 50) if (x !== 100 && x !== 300) out.push([rect(x, 286, 3, 22), K.woodDark]);
  const rows = [
    { y: 308, h: 26, w: 50 },
    { y: 334, h: 32, w: 66.7 },
    { y: 366, h: 34, w: 80 },
  ];
  rows.forEach(({ y, h, w }, r) => {
    for (let i = 0; i * w < 400; i++) out.push([rect(i * w, y, w, h), (i + r) % 2 ? K.matBlue : K.matRed]);
  });
  return out;
};

// ---------- people ----------

/** Kid doing a flying side kick to the right; the standing foot is at (x, ground). */
const kicker = (x: number, ground: number): Entry[] => {
  const hip: Pt = [x + 6, ground - 116];
  return [
    // back arm (behind the body)
    [bar([x - 6, ground - 192], [x - 30, ground - 162], 15), K.white],
    [bar([x - 30, ground - 162], [x - 16, ground - 140], 13), K.white],
    [circle(x - 13, ground - 136, 7.5), K.skin],
    // standing leg and foot
    [poly([[x - 13, ground - 122], [x + 15, ground - 122], [x + 13, ground - 14], [x - 11, ground - 14]]), K.white],
    [smooth([[x - 10, ground - 16], [x + 12, ground - 16], [x + 24, ground - 6], [x + 22, ground], [x - 12, ground]]), K.skin],
    // kicking leg: thigh to foot, foot blade hitting the board
    [poly([[hip[0] - 10, hip[1] - 12], [x + 128, ground - 150], [x + 132, ground - 126], [hip[0] + 4, hip[1] + 16]]), K.white],
    [smooth([[x + 126, ground - 154], [x + 148, ground - 156], [x + 154, ground - 140], [x + 148, ground - 124], [x + 126, ground - 124]]), K.skin],
    [ellipse(x + 140, ground - 140, 7, 4), K.skinShade],
    // jacket leaning back, black trim, belt with tails
    [poly([[x - 26, ground - 206], [x + 8, ground - 210], [x + 22, ground - 112], [x - 14, ground - 104]]), K.white],
    [bar([x - 12, ground - 206], [x + 6, ground - 150], 6), K.black],
    [bar([x + 6, ground - 150], [x + 2, ground - 112], 4), K.wallTrim],
    [bar([x - 18, ground - 118], [x + 24, ground - 124], 9), K.black],
    lock([x - 6, ground - 116], [x - 22, ground - 88], 3.6, K.black),
    lock([x - 2, ground - 116], [x + 2, ground - 86], 3.6, K.black),
    [circle(x - 4, ground - 119, 4.6), K.black],
    // head with a ponytail, headband, eye, ear
    lock([x - 26, ground - 232], [x - 52, ground - 212], 8, K.hair),
    [circle(x - 12, ground - 224, 19), K.skin],
    [`M${x - 31} ${ground - 224}A19 19 0 0 1 ${x + 7} ${ground - 224}Q${x - 8} ${ground - 236} ${x - 31} ${ground - 220}Z`, K.hair],
    [bar([x - 32, ground - 226], [x + 6, ground - 230], 5), K.red],
    [poly([[x - 32, ground - 226], [x - 46, ground - 236], [x - 44, ground - 220]]), K.red],
    [ellipse(x, ground - 224, 2.6, 3.2), K.black],
    [circle(x - 18, ground - 216, 4.6), K.skinShade],
    [circle(x - 7, ground - 216, 3.4), K.cheek],
    [leaf(x - 4, ground - 213, x + 4, ground - 214, 1.6), K.red],
    // front arm in guard
    [bar([x - 2, ground - 196], [x + 28, ground - 176], 15), K.white],
    [bar([x + 28, ground - 176], [x + 34, ground - 206], 13), K.white],
    [circle(x + 35, ground - 212, 8), K.skin],
  ];
};

/** Partner facing left, holding a board out with both hands. */
const holder = (x: number, ground: number): Entry[] => [
  // legs in a front stance
  [poly([[x - 14, ground - 110], [x + 4, ground - 110], [x - 10, ground - 12], [x - 30, ground - 12]]), K.white],
  [poly([[x + 2, ground - 110], [x + 22, ground - 110], [x + 34, ground - 12], [x + 14, ground - 12]]), K.white],
  [smooth([[x - 30, ground - 14], [x - 8, ground - 14], [x - 8, ground], [x - 42, ground], [x - 40, ground - 8]]), K.skin],
  [smooth([[x + 14, ground - 14], [x + 34, ground - 14], [x + 40, ground], [x + 12, ground]]), K.skin],
  // jacket, trim, blue belt
  [poly([[x - 20, ground - 196], [x + 24, ground - 196], [x + 26, ground - 104], [x - 22, ground - 104]]), K.white],
  [bar([x + 10, ground - 194], [x - 6, ground - 140], 5), K.wallTrim],
  [bar([x - 22, ground - 116], [x + 26, ground - 116], 9), K.blue],
  lock([x - 4, ground - 112], [x - 14, ground - 84], 3.6, K.blue),
  lock([x, ground - 112], [x + 4, ground - 84], 3.6, K.blue),
  [circle(x - 2, ground - 116, 4.6), K.blue],
  // head, short hair
  [circle(x + 2, ground - 220, 20), K.skin],
  [`M${x - 18} ${ground - 222}A20 20 0 0 1 ${x + 22} ${ground - 222}L${x + 22} ${ground - 214}Q${x + 6} ${ground - 232} ${x - 18} ${ground - 222}Z`, K.brown],
  [ellipse(x - 9, ground - 216, 2.6, 3.2), K.black],
  [circle(x + 10, ground - 214, 4.6), K.skinShade],
  [leaf(x - 13, ground - 207, x - 5, ground - 207, 1.6), K.red],
  // arms reaching out to the board
  [bar([x - 10, ground - 186], [x - 50, ground - 160], 15), K.white],
  [bar([x - 10, ground - 140], [x - 50, ground - 128], 15), K.white],
];

/** Pine board splitting in two, with splinters flying. */
const board = (x: number, y: number): Entry[] => [
  [poly([[x, y], [x + 14, y + 2], [x + 12, y + 30], [x + 16, y + 36], [x + 10, y + 40], [x + 2, y + 34]]), K.board],
  [poly([[x + 2, y + 44], [x + 12, y + 48], [x + 18, y + 42], [x + 16, y + 78], [x + 2, y + 80]]), K.board],
  [leaf(x + 4, y + 8, x + 6, y + 30, 1.4), K.brown],
  [leaf(x + 6, y + 52, x + 8, y + 74, 1.4), K.brown],
  ...([[x + 30, y + 30, -30], [x + 32, y + 50, 20], [x + 30, y + 4, -60], [x + 28, y + 68, 50]] as const).map(
    ([sx, sy, d]): Entry => {
      const a = (d * Math.PI) / 180;
      return [leaf(sx - Math.cos(a) * 6, sy - Math.sin(a) * 6, sx + Math.cos(a) * 6, sy + Math.sin(a) * 6, 2), K.board];
    },
  ),
];

/** Curved motion streaks behind the kick. */
const streaks = (): Entry[] =>
  [[120, 160, 214, 146], [126, 178, 214, 164], [138, 198, 210, 184]].map(
    ([x1, y1, x2, y2]): Entry => [`M${x1} ${y1}Q${(x1 + x2) / 2} ${y1 - 14} ${x2} ${y2}Q${(x1 + x2) / 2} ${y1 - 8} ${x1} ${y1}Z`, K.yellow],
  );

export const taekwondo: ColoringPage = {
  id: 'taekwondo',
  title: 'Taekwondo Kick',
  viewBox: '0 0 400 400',
  palette: [
    { hex: '#fef3c7', name: 'Wall Cream' },
    { hex: '#94a3b8', name: 'Trim Gray' },
    { hex: '#d6a464', name: 'Maple Floor' },
    { hex: '#92400e', name: 'Dark Wood' },
    { hex: '#ef4444', name: 'Mat Red' },
    { hex: '#3b82f6', name: 'Mat Blue' },
    { hex: '#ffffff', name: 'Uniform White' },
    { hex: '#111827', name: 'Black' },
    { hex: '#f5c6a0', name: 'Skin' },
    { hex: '#e0a47c', name: 'Skin Shade' },
    { hex: '#422006', name: 'Dark Hair' },
    { hex: '#fde047', name: 'Yellow' },
    { hex: '#22c55e', name: 'Green' },
    { hex: '#dc2626', name: 'Red' },
    { hex: '#1d4ed8', name: 'Blue' },
    { hex: '#f59e0b', name: 'Trophy Gold' },
    { hex: '#7f1d1d', name: 'Bag Leather' },
    { hex: '#64748b', name: 'Steel' },
    { hex: '#fcd9a0', name: 'Pine Board' },
    { hex: '#bae6fd', name: 'Window Sky' },
    { hex: '#a16207', name: 'Brown' },
    { hex: '#fda4af', name: 'Cheek Pink' },
    { hex: '#c08552', name: 'Wall Panel' },
  ],
  regions: regions([
    [rect(0, 0, 400, 400), K.wall],
    [rect(0, 230, 400, 56), K.panel],
    [rect(0, 226, 400, 6), K.woodDark],
    ...[50, 150, 200, 250, 350].map((x): Entry => [rect(x - 1.5, 232, 3, 54), K.woodDark]),

    // window with a view
    [rect(150, 28, 104, 78), K.woodDark],
    [rect(156, 34, 44, 66), K.window],
    [rect(204, 34, 44, 66), K.window],
    [circle(232, 54, 9), K.yellow],
    ['M156 88Q178 72 200 86V100H156Z', K.green],
    ['M204 90Q226 76 248 88V100H204Z', K.green],

    ...koreanFlag(12, 20, 126),
    ...beltRack(140, 116),
    ...clock(310, 60),
    ...punchingBag(372),
    ...floor(),

    // the kick
    ...streaks(),
    ...kicker(98, 352),
    ...holder(318, 352),
    ...board(250, 176),
    [circle(266, 190, 7.5), K.skin],
    [circle(266, 224, 7.5), K.skin],

    // a water bottle and towel at the side of the mat
    [rect(16, 300, 14, 30), K.blue],
    [rect(18, 292, 10, 8), K.white],
    [poly([[40, 330], [80, 330], [86, 340], [34, 340]]), K.green],
  ]),
};

import type { ColoringPage } from './types';
import { circle, cloud, leaf, poly, rect, regions, smooth, type Pt } from './shapes';
import { bar, type Entry } from './medieval';

interface HorseColors {
  coat: number;
  mane: number;
  hoof: number;
  muzzle: number;
  blaze: number;
  eye: number;
  /** Optional pinto patches. */
  patch?: number;
  /** White socks on the near legs. */
  sock?: number;
}

/** A standing horse in local coords (hooves at y=0, facing right), mapped onto the page. */
function horse(x: number, y: number, s: number, f: 1 | -1, c: HorseColors): Entry[] {
  const T = ([px, py]: Pt): Pt => [x + s * f * px, y + s * py];
  const P = (pts: Pt[]) => poly(pts.map(T));
  const S = (pts: Pt[]) => smooth(pts.map(T));
  const L = (a: Pt, b: Pt, w: number) => {
    const [ax, ay] = T(a);
    const [bx, by] = T(b);
    return leaf(ax, ay, bx, by, w * s);
  };
  const C = (cx: number, cy: number, r: number) => {
    const [gx, gy] = T([cx, cy]);
    return circle(gx, gy, r * s);
  };

  const frontLeg = (lx: number): Pt[] => [[lx - 7, -78], [lx + 7, -78], [lx + 5, -42], [lx + 4, -10], [lx - 4, -10], [lx - 5, -42]];
  const backLeg = (lx: number): Pt[] => [[lx - 10, -84], [lx + 9, -84], [lx + 7, -52], [lx + 2, -36], [lx + 4, -10], [lx - 4, -10], [lx - 6, -36], [lx - 9, -56]];
  const hoof = (lx: number): Pt[] => [[lx - 5, -11], [lx + 5, -11], [lx + 7, 0], [lx - 7, 0]];
  const sock = (lx: number): Pt[] => [[lx - 4.6, -26], [lx + 4.6, -26], [lx + 4, -11], [lx - 4, -11]];

  const out: Entry[] = [];
  // tail and far legs behind the body
  out.push([L([-66, -100], [-92, -40], 8), c.mane]);
  out.push([L([-66, -96], [-78, -34], 6), c.mane]);
  out.push([L([-64, -104], [-102, -58], 6), c.mane]);
  out.push([P(frontLeg(56)), c.coat], [P(hoof(56)), c.hoof]);
  out.push([P(backLeg(-36)), c.coat], [P(hoof(-36)), c.hoof]);
  // body
  out.push([S([[-60, -112], [-20, -118], [30, -116], [62, -104], [70, -82], [52, -64], [0, -60], [-46, -64], [-70, -80], [-72, -100]]), c.coat]);
  if (c.patch) {
    out.push([S([[-40, -104], [-18, -110], [-4, -96], [-14, -78], [-38, -80]]), c.patch]);
    out.push([S([[18, -88], [34, -96], [46, -84], [36, -70], [20, -72]]), c.patch]);
  }
  // near legs
  out.push([P(frontLeg(42)), c.coat], [P(hoof(42)), c.hoof]);
  out.push([P(backLeg(-50)), c.coat], [P(hoof(-50)), c.hoof]);
  if (c.sock) out.push([P(sock(42)), c.sock], [P(sock(-50)), c.sock]);
  // neck, head
  out.push([S([[38, -112], [60, -150], [80, -172], [97, -160], [86, -128], [72, -88]]), c.coat]);
  out.push([P([[83, -176], [84, -196], [93, -180]]), c.coat]);
  out.push([S([[78, -176], [92, -184], [106, -172], [124, -148], [127, -134], [116, -127], [100, -136], [84, -152]]), c.coat]);
  out.push([P([[90, -179], [96, -197], [100, -177]]), c.coat]);
  out.push([S([[110, -147], [123, -149], [128, -134], [118, -127], [106, -134]]), c.muzzle]);
  out.push([L([95, -177], [113, -150], 3.2), c.blaze]);
  out.push([C(96, -164, 3.4), c.eye]);
  out.push([C(121, -137, 2.2), c.eye]);
  // mane along the neck, plus forelock
  const crest: Pt[] = [[84, -178], [76, -166], [67, -152], [58, -138], [50, -124], [43, -112]];
  for (const [mx, my] of crest) out.push([L([mx, my], [mx - 20, my + 16], 5), c.mane]);
  out.push([L([86, -182], [97, -167], 4), c.mane]);
  return out;
}

const tree = (x: number, r: number): Entry[] => [
  [rect(x - 5, 210 - r * 0.2, 10, 40 + r * 0.2), 12],
  [circle(x, 200 - r * 0.6, r), 4],
];

const flower = (x: number, y: number, color: number): Entry[] => [
  [leaf(x, y + 16, x, y + 4, 2.2), 4],
  ...[0, 72, 144, 216, 288].map((a): Entry => {
    const rad = ((a - 90) * Math.PI) / 180;
    return [circle(x + Math.cos(rad) * 5, y + Math.sin(rad) * 5, 3.6), color];
  }),
  [circle(x, y, 3), 14],
];

export const horses: ColoringPage = {
  id: 'horses',
  title: 'Horse Meadow',
  viewBox: '0 0 400 400',
  palette: [
    { hex: '#93c5fd', name: 'Sky' },
    { hex: '#f8fafc', name: 'White' },
    { hex: '#86efac', name: 'Meadow' },
    { hex: '#15803d', name: 'Leaf Green' },
    { hex: '#b45309', name: 'Chestnut' },
    { hex: '#451a03', name: 'Dark Mane' },
    { hex: '#fbbf24', name: 'Palomino' },
    { hex: '#57534e', name: 'Hoof' },
    { hex: '#fef3c7', name: 'Cream' },
    { hex: '#b91c1c', name: 'Barn Red' },
    { hex: '#475569', name: 'Slate' },
    { hex: '#92400e', name: 'Wood' },
    { hex: '#f472b6', name: 'Pink' },
    { hex: '#facc15', name: 'Sun Yellow' },
    { hex: '#1c1917', name: 'Black' },
    { hex: '#d6d3d1', name: 'Soft Gray' },
    { hex: '#4ade80', name: 'Grass' },
  ],
  regions: regions([
    [rect(0, 0, 400, 400), 1],
    [circle(352, 52, 26), 14],
    [cloud(20, 70, 88), 2],
    [cloud(190, 52, 74), 2],
    ['M0 222Q90 180 180 210T400 200V400H0Z', 17],
    ...tree(40, 26),
    ...tree(94, 20),

    // red barn
    [poly([[236, 168], [282, 128], [328, 168]]), 11],
    [rect(244, 164, 76, 86), 10],
    [poly([[244, 168], [282, 134], [320, 168]]), 10],
    [circle(282, 152, 7), 2],
    [rect(264, 196, 36, 54), 2],
    [rect(268, 200, 28, 46), 10],
    [bar([268, 200], [296, 246], 4), 2],
    [bar([296, 200], [268, 246], 4), 2],
    [rect(326, 176, 54, 74), 10],
    [poly([[322, 180], [352, 160], [384, 180]]), 11],
    [rect(342, 196, 20, 20), 2],
    [rect(345, 199, 14, 14), 15],

    ['M0 246Q200 232 400 246V400H0Z', 3],

    // fence
    [rect(0, 248, 400, 6), 12],
    [rect(0, 268, 400, 6), 12],
    ...[16, 168, 244, 320, 392].map((fx): Entry => [rect(fx - 4, 240, 8, 46), 12]),

    // the horses
    ...horse(140, 352, 1.15, 1, { coat: 5, mane: 6, hoof: 8, muzzle: 16, blaze: 2, eye: 15, sock: 2 }),
    ...horse(332, 366, 0.7, -1, { coat: 7, mane: 9, hoof: 8, muzzle: 16, blaze: 2, eye: 15, patch: 2 }),

    // flowers and grass
    ...flower(30, 372, 13),
    ...flower(58, 386, 14),
    ...flower(220, 384, 13),
    ...flower(380, 380, 14),
    ...flower(258, 300, 13),
    [leaf(100, 398, 94, 376, 3), 4],
    [leaf(108, 398, 116, 378, 3), 4],
    [leaf(300, 398, 296, 380, 3), 4],
    [leaf(306, 398, 314, 382, 3), 4],
  ]),
};

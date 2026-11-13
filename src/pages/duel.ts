import type { ColoringPage } from './types';
import { circle, cloud, leaf, poly, rect, regions, smooth, type Pt } from './shapes';
import { arch, banner, bar, battlement, knight, type Entry } from './medieval';

const sagY = (x: number) => 92 + 26 * Math.sin((Math.PI * x) / 400);

/** Rope of bunting flags sagging across the sky. */
const bunting = (): Entry[] => {
  const top: Pt[] = [];
  const bottom: Pt[] = [];
  for (let x = 0; x <= 400; x += 20) {
    top.push([x, sagY(x) - 1.5]);
    bottom.unshift([x, sagY(x) + 1.5]);
  }
  const out: Entry[] = [[poly([...top, ...bottom]), 12]];
  const colors = [9, 11, 10, 15];
  let i = 0;
  for (let x = 22; x < 400; x += 32) {
    const y = sagY(x) + 1;
    out.push([poly([[x - 9, y], [x + 9, y], [x, y + 17]]), colors[i++ % colors.length]]);
  }
  return out;
};

/** Striped pavilion tent. */
const tent = (x: number, stripe: number): Entry[] => {
  const w = 84;
  const cx = x + w / 2;
  return [
    [rect(cx - 1.2, 132, 2.5, 34), 7],
    [poly([[cx + 1.3, 134], [cx + 20, 140], [cx + 1.3, 146]]), stripe === 9 ? 10 : 9],
    [rect(x, 200, w, 52), 13],
    [rect(x + 14, 200, 14, 52), stripe],
    [rect(x + w - 28, 200, 14, 52), stripe],
    [poly([[cx - 11, 252], [cx, 216], [cx + 11, 252]]), 8],
    [poly([[x - 8, 204], [cx, 164], [x + w + 8, 204]]), stripe],
    [poly([[cx - 14, 196], [cx, 172], [cx + 14, 196]]), 11],
  ];
};

export const duel: ColoringPage = {
  id: 'duel',
  title: "Knights' Duel",
  viewBox: '0 0 400 400',
  palette: [
    { hex: '#93c5fd', name: 'Sky' },
    { hex: '#f8fafc', name: 'Cloud' },
    { hex: '#4ade80', name: 'Grass' },
    { hex: '#15803d', name: 'Hills' },
    { hex: '#d6cfc2', name: 'Stone' },
    { hex: '#cbd5e1', name: 'Steel' },
    { hex: '#64748b', name: 'Iron' },
    { hex: '#1e293b', name: 'Shadow' },
    { hex: '#dc2626', name: 'Red' },
    { hex: '#2563eb', name: 'Blue' },
    { hex: '#facc15', name: 'Gold' },
    { hex: '#92400e', name: 'Wood' },
    { hex: '#fef3c7', name: 'Canvas' },
    { hex: '#f5d69b', name: 'Sand' },
    { hex: '#7c3aed', name: 'Purple' },
  ],
  regions: regions([
    [rect(0, 0, 400, 400), 1],
    [cloud(14, 62, 86), 2],
    [cloud(285, 50, 96), 2],
    ['M0 215Q100 168 200 204T400 188V400H0Z', 4],

    // distant castle on the hill
    [rect(150, 136, 18, 70), 5],
    [poly([[146, 138], [159, 112], [172, 138]]), 15],
    [rect(232, 136, 18, 70), 5],
    [poly([[228, 138], [241, 112], [254, 138]]), 15],
    [battlement(166, 152, 68, 54, 5, 6), 5],
    [arch(191, 178, 18, 28), 8],
    [rect(158.2, 98, 1.8, 15), 7],
    [poly([[160, 99], [172, 103], [160, 107]]), 9],
    [rect(240.2, 98, 1.8, 15), 7],
    [poly([[242, 99], [254, 103], [242, 107]]), 10],

    ['M0 236Q200 222 400 236V400H0Z', 3],
    ...bunting(),
    ...tent(14, 9),
    ...tent(302, 10),

    // wooden barrier with hanging shields
    [rect(0, 262, 400, 8), 12],
    ...[24, 200, 376].map((x): Entry => [rect(x - 4, 256, 8, 46), 12]),
    [banner(62, 270, 22, 26), 9],
    [banner(326, 270, 22, 26), 10],

    ['M0 298Q200 286 400 298V400H0Z', 14],
    // broken lance and rocks on the ground
    [bar([18, 378], [88, 356], 6), 12],
    [poly([[88, 352], [100, 349], [94, 357], [104, 356], [90, 362]]), 13],
    [smooth([[300, 392], [306, 380], [322, 378], [330, 390], [318, 397]]), 5],
    [smooth([[366, 372], [372, 362], [384, 364], [386, 376], [374, 380]]), 5],
    [leaf(12, 318, 26, 300, 3), 3],
    [leaf(388, 330, 376, 310, 3), 3],

    // the duel
    ...knight({
      x: 122, y: 386, scale: 1.05, facing: 1, weapon: 'sword-high',
      colors: { steel: 6, iron: 7, shadow: 8, tabard: 9, emblem: 11, belt: 12, plume: 11, shieldRim: 11, shieldA: 9, shieldB: 15, shieldMark: 11, wood: 12 },
    }),
    ...knight({
      x: 278, y: 386, scale: 1.05, facing: -1, weapon: 'sword-high',
      colors: { steel: 6, iron: 7, shadow: 8, tabard: 10, emblem: 11, belt: 12, plume: 9, shieldRim: 11, shieldA: 10, shieldB: 2, shieldMark: 9, wood: 12 },
    }),
    // spark where the blades meet
    [circle(200, 150, 4), 11],
  ]),
};

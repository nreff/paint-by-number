import type { ColoringPage } from './types';
import { circle, cloud, leaf, poly, rect, regions, smooth, type Pt } from './shapes';
import { arch, bar, battlement, knight, type Entry } from './medieval';

const shoulder: Pt = [302, 228];
const tips: Pt[] = [[246, 118], [282, 64], [336, 52], [384, 86], [398, 150], [380, 200]];

/** Bat wing: scalloped membrane panels between bony fingers. */
const wing = (): Entry[] => {
  const out: Entry[] = [];
  for (let i = 0; i < tips.length - 1; i++) {
    const a = tips[i];
    const b = tips[i + 1];
    const ctrl: Pt = [(a[0] + b[0]) / 2 + (shoulder[0] - (a[0] + b[0]) / 2) * 0.3, (a[1] + b[1]) / 2 + (shoulder[1] - (a[1] + b[1]) / 2) * 0.3];
    out.push([`M${shoulder[0]} ${shoulder[1]}L${a[0]} ${a[1]}Q${ctrl[0].toFixed(1)} ${ctrl[1].toFixed(1)} ${b[0]} ${b[1]}Z`, i % 2 ? 8 : 17]);
  }
  for (const t of tips) out.push([bar(shoulder, t, 4), 6]);
  out.push([circle(shoulder[0], shoulder[1], 6), 6]);
  return out;
};

const spike = (x: number, y: number, ang: number, len = 13): Entry => {
  const a = (ang * Math.PI) / 180;
  const d: Pt = [Math.cos(a), Math.sin(a)];
  const p: Pt = [-d[1] * 6, d[0] * 6];
  return [poly([[x + p[0], y + p[1]], [x + d[0] * len, y + d[1] * len], [x - p[0], y - p[1]]]), 9];
};

const claws = (x: number, y: number): Entry[] =>
  [0, 9, 18].map((dx): Entry => [poly([[x + dx, y], [x + dx + 7, y], [x + dx + 1, y + 9]]), 9]);

const mountain = (x: number, peak: number, w: number): Entry[] => {
  const top: Pt = [x + w / 2, peak];
  const capY = peak + 28;
  const k = 28 / (260 - peak);
  return [
    [poly([[x, 262], top, [x + w, 262]]), 3],
    [poly([[top[0] - (w / 2) * k, capY], top, [top[0] + (w / 2) * k, capY], [top[0] + 6, capY - 6], [top[0], capY + 2], [top[0] - 7, capY - 5]]), 2],
  ];
};

export const dragon: ColoringPage = {
  id: 'dragon',
  title: 'Knight vs Dragon',
  viewBox: '0 0 400 400',
  palette: [
    { hex: '#bae6fd', name: 'Sky' },
    { hex: '#f8fafc', name: 'Snow' },
    { hex: '#94a3b8', name: 'Mountain' },
    { hex: '#84cc16', name: 'Grass' },
    { hex: '#a8a29e', name: 'Rock' },
    { hex: '#15803d', name: 'Dragon Green' },
    { hex: '#bef264', name: 'Belly' },
    { hex: '#a78bfa', name: 'Wing' },
    { hex: '#fef3c7', name: 'Bone' },
    { hex: '#f97316', name: 'Fire' },
    { hex: '#fde047', name: 'Gold' },
    { hex: '#cbd5e1', name: 'Steel' },
    { hex: '#64748b', name: 'Iron' },
    { hex: '#1e293b', name: 'Shadow' },
    { hex: '#dc2626', name: 'Red' },
    { hex: '#2563eb', name: 'Blue' },
    { hex: '#c4b5fd', name: 'Lilac' },
  ],
  regions: regions([
    [rect(0, 0, 400, 400), 1],
    [cloud(12, 60, 80), 2],
    [cloud(150, 40, 70), 2],
    ...mountain(-30, 150, 170),
    ...mountain(90, 120, 200),

    // ruined watchtower behind the knight
    [battlement(8, 150, 44, 140, 3, 8), 5],
    [arch(23, 175, 14, 24), 14],
    [arch(23, 225, 14, 24), 14],

    ['M0 270Q200 252 400 270V400H0Z', 4],

    // dragon: wing and tail behind the body
    ...wing(),
    [smooth([[350, 318], [384, 326], [398, 356], [372, 384], [328, 378], [338, 366], [366, 368], [378, 350], [360, 338], [340, 334]]), 6],
    [poly([[332, 370], [306, 382], [330, 392]]), 9],
    ...[[262, 200, -40], [278, 222, -35], [304, 226, -95], [326, 228, -75], [348, 236, -55], [368, 254, -35], [388, 330, -10]].map(([x, y, a]) =>
      spike(x, y, a),
    ),
    // back leg
    [smooth([[336, 306], [366, 316], [364, 356], [352, 374], [334, 372], [336, 344]]), 6],
    ...claws(334, 372),
    // body and belly
    [smooth([[250, 300], [258, 252], [300, 226], [352, 236], [378, 282], [356, 322], [300, 332]]), 6],
    [smooth([[262, 298], [272, 264], [298, 254], [326, 268], [322, 306], [290, 320]]), 7],
    [bar([268, 280], [324, 280], 3), 6],
    [bar([270, 298], [318, 298], 3), 6],
    // front leg
    [smooth([[266, 298], [292, 308], [284, 350], [276, 372], [258, 372], [262, 338]]), 6],
    ...claws(255, 372),
    // neck and head
    [smooth([[252, 262], [244, 220], [226, 194], [246, 182], [264, 206], [288, 240]]), 6],
    [smooth([[256, 256], [250, 224], [238, 202], [248, 198], [258, 220], [270, 250]]), 7],
    [poly([[248, 166], [270, 138], [258, 170]]), 9],
    [poly([[236, 164], [250, 136], [246, 166]]), 9],
    [smooth([[200, 186], [214, 166], [244, 160], [262, 174], [256, 192], [226, 196]]), 6],
    [poly([[200, 190], [246, 194], [206, 202]]), 15],
    [poly([[206, 194], [242, 198], [250, 194], [246, 208], [214, 210]]), 6],
    [poly([[210, 190], [214, 195], [218, 190]]), 9],
    [poly([[222, 191], [226, 196], [230, 191]]), 9],
    [circle(240, 172, 5.5), 11],
    [leaf(240, 168, 240, 176, 0.8), 14],
    [circle(207, 178, 2.5), 14],

    // treasure hoard
    [smooth([[176, 386], [184, 366], [208, 358], [224, 372], [220, 390]]), 11],
    [circle(188, 382, 5), 11],
    [circle(206, 386, 5), 11],
    [poly([[198, 366], [204, 360], [210, 366], [204, 374]]), 15],
    [poly([[184, 372], [189, 366], [194, 372], [189, 379]]), 16],

    // rocks
    [smooth([[112, 392], [118, 378], [136, 376], [144, 388], [130, 397]]), 5],
    [smooth([[6, 352], [14, 340], [30, 342], [32, 356], [18, 360]]), 5],

    // the knight
    ...knight({
      x: 78, y: 388, scale: 1, facing: 1, weapon: 'sword-forward',
      colors: { steel: 12, iron: 13, shadow: 14, tabard: 16, emblem: 11, belt: 13, plume: 15, shieldRim: 11, shieldA: 15, shieldB: 16, shieldMark: 11, wood: 13 },
    }),

    // fire breath
    [leaf(204, 196, 112, 232, 20), 10],
    [leaf(198, 198, 130, 228, 10), 11],
    [leaf(196, 188, 140, 190, 5), 10],
    [leaf(196, 204, 150, 252, 5), 10],
  ]),
};

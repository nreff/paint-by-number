import type { ColoringPage } from './types';
import { circle, ellipse, leaf, mirrorX, petal, poly, rect, regions, scalePts, smooth, type Pt } from './shapes';

type Entry = [string, number];

const upper: Pt[] = [[195, 185], [165, 115], [115, 78], [68, 95], [70, 160], [120, 200]];
const lower: Pt[] = [[195, 210], [135, 215], [98, 258], [115, 312], [165, 300], [192, 245]];

const wingSet = (mirror: boolean): Entry[] => {
  const m = (pts: Pt[]) => (mirror ? mirrorX(pts, 200) : pts);
  const mx = (x: number) => (mirror ? 400 - x : x);
  return [
    [smooth(m(upper)), 5],
    [smooth(scalePts(m(upper), 0.8)), 2],
    [circle(mx(110), 120, 16), 4],
    [circle(mx(150), 160, 10), 9],
    [smooth(m(lower)), 5],
    [smooth(scalePts(m(lower), 0.78)), 3],
    [circle(mx(140), 265, 13), 4],
  ];
};

const smallFlower = (cx: number, cy: number): Entry[] => [
  ...[0, 72, 144, 216, 288].map((a): Entry => [petal(cx, cy, 20, 7, a - 90), 7]),
  [circle(cx, cy, 7), 4],
];

export const butterfly: ColoringPage = {
  id: 'butterfly',
  title: 'Butterfly Garden',
  viewBox: '0 0 400 400',
  palette: [
    { hex: '#fef9c3', name: 'Butter' },
    { hex: '#f97316', name: 'Orange' },
    { hex: '#8b5cf6', name: 'Purple' },
    { hex: '#fde047', name: 'Yellow' },
    { hex: '#1f2937', name: 'Ink' },
    { hex: '#86efac', name: 'Meadow' },
    { hex: '#f472b6', name: 'Pink' },
    { hex: '#16a34a', name: 'Leaf' },
    { hex: '#38bdf8', name: 'Sky Blue' },
  ],
  regions: regions([
    [rect(0, 0, 400, 400), 1],
    ['M0 340Q100 320 200 338T400 332V400H0Z', 6],
    [leaf(55, 395, 30, 345, 9), 8],
    [leaf(345, 395, 372, 345, 9), 8],
    ...smallFlower(55, 340),
    ...smallFlower(345, 340),
    ...wingSet(false),
    ...wingSet(true),
    [poly([[196, 135], [199, 135], [180, 92], [176, 95]]), 5],
    [poly([[201, 135], [204, 135], [224, 95], [220, 92]]), 5],
    [circle(177, 90, 6), 5],
    [circle(223, 90, 6), 5],
    [ellipse(200, 215, 11, 72), 5],
    [circle(200, 138, 14), 5],
  ]),
};

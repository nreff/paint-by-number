import type { ColoringPage } from './types';
import { circle, leaf, petal, poly, rect, regions } from './shapes';

type Entry = [string, number];

const flower = (cx: number, cy: number, count: number, len: number, w: number, colors: number[], center: number, r: number): Entry[] => {
  const out: Entry[] = [];
  for (let i = 0; i < count; i++) out.push([petal(cx, cy, len, w, (360 / count) * i - 90), colors[i % colors.length]]);
  out.push([circle(cx, cy, r), center]);
  return out;
};

export const flowers: ColoringPage = {
  id: 'flowers',
  title: 'Flower Pot',
  viewBox: '0 0 400 400',
  palette: [
    { hex: '#ccfbf1', name: 'Mint' },
    { hex: '#d97706', name: 'Wood' },
    { hex: '#c2410c', name: 'Terracotta' },
    { hex: '#fb923c', name: 'Clay' },
    { hex: '#16a34a', name: 'Leaf' },
    { hex: '#f472b6', name: 'Pink' },
    { hex: '#a78bfa', name: 'Violet' },
    { hex: '#facc15', name: 'Yellow' },
  ],
  regions: regions([
    [rect(0, 0, 400, 400), 1],
    [rect(0, 325, 400, 75), 2],
    [poly([[197, 245], [203, 245], [203, 120], [197, 120]]), 5],
    [poly([[186, 245], [193, 245], [144, 168], [137, 172]]), 5],
    [poly([[207, 245], [214, 245], [266, 180], [260, 176]]), 5],
    [leaf(200, 225, 148, 205, 12), 5],
    [leaf(200, 210, 255, 196, 12), 5],
    ...flower(200, 112, 6, 42, 11, [6], 8, 15),
    ...flower(140, 165, 5, 32, 10, [7], 8, 11),
    ...flower(265, 175, 5, 32, 10, [6, 7], 8, 11),
    [poly([[142, 250], [258, 250], [244, 345], [156, 345]]), 3],
    [rect(130, 235, 140, 24), 4],
  ]),
};

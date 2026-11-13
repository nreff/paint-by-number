import type { ColoringPage } from './types';
import { circle, ellipse, poly, rect, regions, star } from './shapes';

export const rocket: ColoringPage = {
  id: 'rocket',
  title: 'Rocket Trip',
  viewBox: '0 0 400 400',
  palette: [
    { hex: '#1e1b4b', name: 'Night' },
    { hex: '#e5e7eb', name: 'Silver' },
    { hex: '#ef4444', name: 'Red' },
    { hex: '#60a5fa', name: 'Window Blue' },
    { hex: '#f97316', name: 'Flame' },
    { hex: '#fde047', name: 'Spark' },
    { hex: '#a855f7', name: 'Planet' },
    { hex: '#2dd4bf', name: 'Ring' },
    { hex: '#fef08a', name: 'Moonlight' },
  ],
  regions: regions([
    [rect(0, 0, 400, 400), 1],
    [ellipse(90, 305, 72, 16, -20), 8],
    [circle(90, 305, 40), 7],
    [circle(330, 70, 30), 9],
    [circle(320, 62, 7), 2],
    [circle(340, 82, 5), 2],
    [star(50, 60, 12, 5), 9],
    [star(150, 40, 9, 4), 9],
    [star(265, 150, 10, 4), 9],
    [star(360, 210, 12, 5), 9],
    [star(40, 185, 9, 4), 9],
    [star(335, 335, 12, 5), 9],
    // flames, then fins, then body
    ['M185 300Q210 392 235 300Z', 5],
    ['M197 300Q210 352 223 300Z', 6],
    [poly([[182, 235], [148, 305], [184, 298]]), 3],
    [poly([[238, 235], [272, 305], [236, 298]]), 3],
    [rect(180, 160, 60, 140), 2],
    ['M180 160Q180 110 210 70Q240 110 240 160Z', 3],
    [rect(180, 268, 60, 14), 3],
    [circle(210, 200, 23), 3],
    [circle(210, 200, 15), 4],
  ]),
};

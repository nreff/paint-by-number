import type { ColoringPage } from './types';
import { circle, cloud, poly, rect, regions } from './shapes';

const bird = (x: number, y: number, s: number) =>
  poly([[x, y], [x + 12 * s, y + 7 * s], [x + 24 * s, y], [x + 24 * s, y + 6 * s], [x + 12 * s, y + 14 * s], [x, y + 6 * s]]);

export const sunset: ColoringPage = {
  id: 'sunset',
  title: 'Sunset Hills',
  viewBox: '0 0 400 400',
  palette: [
    { hex: '#a78bfa', name: 'Lavender' },
    { hex: '#f472b6', name: 'Pink' },
    { hex: '#fb923c', name: 'Orange' },
    { hex: '#fde047', name: 'Sun Yellow' },
    { hex: '#15803d', name: 'Forest' },
    { hex: '#4ade80', name: 'Grass' },
    { hex: '#92400e', name: 'Bark' },
    { hex: '#fce7f3', name: 'Blush' },
    { hex: '#374151', name: 'Charcoal' },
  ],
  regions: regions([
    [rect(0, 0, 400, 140), 1],
    [rect(0, 140, 400, 80), 2],
    [rect(0, 220, 400, 180), 3],
    [circle(200, 250, 65), 4],
    [cloud(30, 120, 120), 8],
    [cloud(240, 80, 130), 8],
    [bird(110, 60, 1), 9],
    [bird(150, 85, 0.8), 9],
    ['M0 265Q100 195 200 255T400 235V400H0Z', 5],
    ['M0 325Q120 255 260 315T400 305V400H0Z', 6],
    [rect(310, 255, 14, 50), 7],
    [circle(317, 240, 30), 5],
    [circle(60, 350, 8), 2],
    [circle(95, 368, 8), 4],
    [circle(140, 352, 8), 2],
    [circle(200, 375, 8), 4],
  ]),
};

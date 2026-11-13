import type { ColoringPage } from './types';
import { circle, ellipse, poly, rect, regions } from './shapes';

export const cottage: ColoringPage = {
  id: 'cottage',
  title: 'Cozy Cottage',
  viewBox: '0 0 400 400',
  palette: [
    { hex: '#7dd3fc', name: 'Sky' },
    { hex: '#4ade80', name: 'Grass' },
    { hex: '#fef3c7', name: 'Cream' },
    { hex: '#dc2626', name: 'Red' },
    { hex: '#92400e', name: 'Brown' },
    { hex: '#fde047', name: 'Yellow' },
    { hex: '#15803d', name: 'Tree Green' },
    { hex: '#9ca3af', name: 'Stone' },
  ],
  regions: regions([
    [rect(0, 0, 400, 400), 1],
    [circle(345, 60, 30), 6],
    ['M0 295Q200 255 400 295V400H0Z', 2],
    [poly([[178, 400], [232, 400], [218, 330], [192, 330]]), 8],
    [rect(255, 120, 22, 55), 8],
    [rect(110, 200, 190, 130), 3],
    [poly([[92, 207], [205, 118], [318, 207]]), 4],
    ['M185 330V280Q205 255 225 280V330Z', 5],
    [rect(130, 230, 40, 35), 6],
    [rect(240, 230, 40, 35), 6],
    [circle(205, 172, 14), 6],
    [rect(333, 230, 16, 75), 5],
    [circle(341, 210, 40), 7],
    [ellipse(105, 330, 28, 17), 7],
    [ellipse(300, 332, 22, 14), 7],
    [circle(45, 345, 8), 4],
    [circle(70, 362, 8), 6],
    [circle(40, 375, 8), 4],
    [circle(360, 360, 8), 6],
  ]),
};

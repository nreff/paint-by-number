import type { ColoringPage } from './types';
import { circle, ellipse, leaf, poly, rect, regions, smooth } from './shapes';

export const fish: ColoringPage = {
  id: 'fish',
  title: 'Happy Fish',
  viewBox: '0 0 400 400',
  palette: [
    { hex: '#7dd3fc', name: 'Ocean' },
    { hex: '#2563eb', name: 'Deep Blue' },
    { hex: '#f97316', name: 'Orange' },
    { hex: '#facc15', name: 'Yellow' },
    { hex: '#22c55e', name: 'Seaweed' },
    { hex: '#fde68a', name: 'Sand' },
    { hex: '#f0f9ff', name: 'Bubble' },
    { hex: '#fb7185', name: 'Coral' },
  ],
  regions: regions([
    [rect(0, 0, 400, 400), 1],
    ['M0 255Q50 240 100 255T200 255T300 255T400 255V400H0Z', 2],
    [leaf(60, 360, 45, 235, 13), 5],
    [leaf(85, 360, 100, 260, 11), 5],
    [leaf(345, 360, 360, 245, 13), 5],
    [smooth([[255, 365], [250, 320], [275, 300], [290, 325], [310, 295], [330, 320], [325, 365]]), 8],
    ['M0 345Q100 325 200 345T400 340V400H0Z', 6],
    // fish: tail and fin first so the body overlaps their joints
    [poly([[118, 180], [55, 128], [72, 180], [55, 232]]), 4],
    ['M150 135Q185 75 235 135Z', 4],
    [ellipse(190, 180, 85, 55), 3],
    ['M168 132Q186 180 168 228Q156 180 168 132Z', 4],
    ['M213 132Q231 180 213 228Q201 180 213 132Z', 4],
    [leaf(198, 192, 186, 220, 7), 4],
    [circle(245, 165, 13), 7],
    [circle(249, 165, 6), 2],
    // little fish
    [poly([[318, 250], [298, 238], [302, 250], [298, 262]]), 3],
    [ellipse(338, 250, 24, 13), 4],
    [circle(290, 115, 9), 7],
    [circle(305, 90, 6), 7],
    [circle(296, 62, 11), 7],
  ]),
};

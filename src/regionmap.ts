// Rasterizes a page into an id map (which region is on top at each point).
// Used for (1) automatic label placement and (2) hit-testing / forgiving taps.
// Works for any ColoringPage, so generated pages get labels for free.

import type { ColoringPage } from './pages/types';

export interface Label {
  x: number;
  y: number;
  /** Distance (viewBox units) from the label point to the region's edge. */
  radius: number;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const RES = 640;
const check = (idx: number) => (idx * 97 + 31) & 255;

export function parseViewBox(vb: string): Box {
  const [x, y, w, h] = vb.trim().split(/[\s,]+/).map(Number);
  return { x, y, w, h };
}

export class RegionMap {
  readonly box: Box;
  readonly scale: number;
  readonly width: number;
  readonly height: number;
  /** Region index per pixel, -1 where ambiguous (anti-aliased edges). */
  private ids: Int32Array;
  readonly labels: (Label | null)[];
  readonly bounds: (Box | null)[];

  constructor(page: ColoringPage) {
    this.box = parseViewBox(page.viewBox);
    this.scale = RES / Math.max(this.box.w, this.box.h);
    this.width = Math.ceil(this.box.w * this.scale);
    this.height = Math.ceil(this.box.h * this.scale);
    const W = this.width;
    const H = this.height;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.setTransform(this.scale, 0, 0, this.scale, -this.box.x * this.scale, -this.box.y * this.scale);
    page.regions.forEach((r, i) => {
      const idx = i + 1;
      ctx.fillStyle = `rgb(${idx & 255},${(idx >> 8) & 255},${check(idx)})`;
      ctx.fill(new Path2D(r.d));
    });
    const data = ctx.getImageData(0, 0, W, H).data;
    const ids = new Int32Array(W * H);
    for (let k = 0; k < W * H; k++) {
      const o = k * 4;
      const idx = data[o] | (data[o + 1] << 8);
      ids[k] = data[o + 3] === 255 && idx > 0 && idx <= page.regions.length && data[o + 2] === check(idx) ? idx - 1 : -1;
    }
    this.ids = ids;

    // Chamfer distance transform: distance to nearest pixel of another region.
    const INF = 1e9;
    const dist = new Float32Array(W * H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const k = y * W + x;
        const id = ids[k];
        const edge =
          id < 0 || x === 0 || y === 0 || x === W - 1 || y === H - 1 ||
          ids[k - 1] !== id || ids[k + 1] !== id || ids[k - W] !== id || ids[k + W] !== id;
        dist[k] = edge ? 1 : INF;
      }
    }
    const D = Math.SQRT2;
    for (let y = 1; y < H; y++) {
      for (let x = 1; x < W - 1; x++) {
        const k = y * W + x;
        if (dist[k] <= 1) continue;
        dist[k] = Math.min(dist[k], dist[k - 1] + 1, dist[k - W] + 1, dist[k - W - 1] + D, dist[k - W + 1] + D);
      }
    }
    for (let y = H - 2; y >= 0; y--) {
      for (let x = W - 2; x >= 1; x--) {
        const k = y * W + x;
        if (dist[k] <= 1) continue;
        dist[k] = Math.min(dist[k], dist[k + 1] + 1, dist[k + W] + 1, dist[k + W + 1] + D, dist[k + W - 1] + D);
      }
    }

    const n = page.regions.length;
    const best = new Float32Array(n);
    const bestK = new Int32Array(n).fill(-1);
    const minX = new Int32Array(n).fill(W);
    const minY = new Int32Array(n).fill(H);
    const maxX = new Int32Array(n).fill(-1);
    const maxY = new Int32Array(n).fill(-1);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const k = y * W + x;
        const id = ids[k];
        if (id < 0) continue;
        if (dist[k] > best[id]) {
          best[id] = dist[k];
          bestK[id] = k;
        }
        if (x < minX[id]) minX[id] = x;
        if (x > maxX[id]) maxX[id] = x;
        if (y < minY[id]) minY[id] = y;
        if (y > maxY[id]) maxY[id] = y;
      }
    }
    this.labels = [];
    this.bounds = [];
    for (let i = 0; i < n; i++) {
      if (bestK[i] < 0) {
        this.labels.push(null);
        this.bounds.push(null);
        continue;
      }
      const k = bestK[i];
      const [x, y] = this.toView((k % W) + 0.5, Math.floor(k / W) + 0.5);
      this.labels.push({ x, y, radius: best[i] / this.scale });
      const [bx, by] = this.toView(minX[i], minY[i]);
      this.bounds.push({ x: bx, y: by, w: (maxX[i] - minX[i] + 1) / this.scale, h: (maxY[i] - minY[i] + 1) / this.scale });
    }
  }

  private toView(px: number, py: number): [number, number] {
    return [this.box.x + px / this.scale, this.box.y + py / this.scale];
  }

  private idAtPixel(px: number, py: number): number {
    if (px < 0 || py < 0 || px >= this.width || py >= this.height) return -1;
    return this.ids[py * this.width + px];
  }

  /** Topmost region index at a viewBox point (with a tiny search on anti-aliased edges). */
  hit(x: number, y: number): number {
    const px = Math.floor((x - this.box.x) * this.scale);
    const py = Math.floor((y - this.box.y) * this.scale);
    const id = this.idAtPixel(px, py);
    if (id >= 0) return id;
    return this.nearest(x, y, 2 / this.scale, () => true);
  }

  /** Nearest region index within `radius` viewBox units satisfying `accept`, or -1. */
  nearest(x: number, y: number, radius: number, accept: (index: number) => boolean): number {
    const cx = (x - this.box.x) * this.scale;
    const cy = (y - this.box.y) * this.scale;
    const r = Math.max(1, Math.ceil(radius * this.scale));
    const r2 = r * r;
    let bestId = -1;
    let bestD = Infinity;
    const seen = new Map<number, boolean>();
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const d = dx * dx + dy * dy;
        if (d > r2 || d >= bestD) continue;
        const id = this.idAtPixel(Math.floor(cx + dx), Math.floor(cy + dy));
        if (id < 0) continue;
        let ok = seen.get(id);
        if (ok === undefined) {
          ok = accept(id);
          seen.set(id, ok);
        }
        if (ok) {
          bestD = d;
          bestId = id;
        }
      }
    }
    return bestId;
  }
}

const cache = new Map<string, RegionMap>();
export function regionMapFor(page: ColoringPage): RegionMap {
  let m = cache.get(page.id);
  if (!m) {
    m = new RegionMap(page);
    cache.set(page.id, m);
  }
  return m;
}

// Renderer-agnostic coloring state. Knows only region ids and color numbers,
// so an SVG view today and a Three.js view later can drive the same logic.

import type { ColoringPage } from '../pages/types';
import { loadProgress, saveProgress } from '../storage';

export type FillResult = 'filled' | 'wrong' | 'noop';

interface HistoryEntry {
  id: string;
  prev: number | undefined;
}

export class ColoringSession {
  readonly page: ColoringPage;
  private fills: Record<string, number>;
  private history: HistoryEntry[] = [];
  private listeners = new Set<() => void>();
  private targets = new Map<string, number>();
  selected = 1;
  freeMode = false;

  constructor(page: ColoringPage) {
    this.page = page;
    for (const r of page.regions) this.targets.set(r.id, r.color);
    const saved = loadProgress(page.id).fills;
    this.fills = {};
    for (const [id, c] of Object.entries(saved)) {
      if (this.targets.has(id) && c >= 1 && c <= page.palette.length) this.fills[id] = c;
    }
    const firstLeft = this.firstColorWithRemaining();
    if (firstLeft) this.selected = firstLeft;
  }

  onChange(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    for (const fn of this.listeners) fn();
  }

  private persist(): void {
    saveProgress(this.page.id, { fills: this.fills });
  }

  target(id: string): number | undefined {
    return this.targets.get(id);
  }

  fillOf(id: string): number | undefined {
    return this.fills[id];
  }

  isDone(id: string): boolean {
    return this.fills[id] !== undefined && this.fills[id] === this.targets.get(id);
  }

  /** Can the currently selected color be applied to this region? */
  canFill(id: string): boolean {
    if (!this.targets.has(id)) return false;
    if (this.freeMode) return this.fills[id] !== this.selected;
    return !this.isDone(id) && this.targets.get(id) === this.selected;
  }

  select(color: number): void {
    if (color < 1 || color > this.page.palette.length) return;
    this.selected = color;
    this.emit();
  }

  setFreeMode(on: boolean): void {
    this.freeMode = on;
    this.emit();
  }

  tryFill(id: string): FillResult {
    if (!this.targets.has(id)) return 'noop';
    if (!this.canFill(id)) {
      if (this.freeMode || this.isDone(id)) return 'noop';
      return 'wrong';
    }
    this.history.push({ id, prev: this.fills[id] });
    this.fills[id] = this.selected;
    this.persist();
    this.emit();
    return 'filled';
  }

  canUndo(): boolean {
    return this.history.length > 0;
  }

  undo(): string | undefined {
    const last = this.history.pop();
    if (!last) return undefined;
    if (last.prev === undefined) delete this.fills[last.id];
    else this.fills[last.id] = last.prev;
    this.persist();
    this.emit();
    return last.id;
  }

  reset(): void {
    this.fills = {};
    this.history = [];
    this.persist();
    const first = this.firstColorWithRemaining();
    if (first) this.selected = first;
    this.emit();
  }

  progress(): { done: number; total: number } {
    let done = 0;
    for (const r of this.page.regions) if (this.isDone(r.id)) done++;
    return { done, total: this.page.regions.length };
  }

  isComplete(): boolean {
    const p = this.progress();
    return p.done === p.total;
  }

  /** Regions still needing color n (in strict terms). */
  remaining(color: number): string[] {
    return this.page.regions.filter((r) => r.color === color && !this.isDone(r.id)).map((r) => r.id);
  }

  firstColorWithRemaining(): number | undefined {
    for (let c = 1; c <= this.page.palette.length; c++) if (this.remaining(c).length) return c;
    return undefined;
  }
}

/** Progress for a page without constructing a session (gallery cards). */
export function pageProgress(page: ColoringPage): { done: number; total: number; fills: Record<string, number> } {
  const fills = loadProgress(page.id).fills;
  let done = 0;
  for (const r of page.regions) if (fills[r.id] === r.color) done++;
  return { done, total: page.regions.length, fills };
}

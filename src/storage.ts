// Per-page progress in localStorage. Every access is guarded: storage can be
// unavailable (private mode, blocked site data) and the app must still work.

export interface SavedProgress {
  fills: Record<string, number>;
}

const KEY = (pageId: string) => `pbn:progress:${pageId}`;
const PREFS = 'pbn:prefs';

export function loadProgress(pageId: string): SavedProgress {
  try {
    const raw = localStorage.getItem(KEY(pageId));
    if (raw) {
      const parsed = JSON.parse(raw) as SavedProgress;
      if (parsed && typeof parsed.fills === 'object') return parsed;
    }
  } catch {
    /* ignore */
  }
  return { fills: {} };
}

export function saveProgress(pageId: string, progress: SavedProgress): void {
  try {
    localStorage.setItem(KEY(pageId), JSON.stringify(progress));
  } catch {
    /* ignore */
  }
}

export interface Prefs {
  freeMode: boolean;
}

export function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS);
    if (raw) return { freeMode: false, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { freeMode: false };
}

export function savePrefs(prefs: Prefs): void {
  try {
    localStorage.setItem(PREFS, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

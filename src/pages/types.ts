/**
 * The page contract. Hand-authored pages and (later) image-generated pages
 * both produce this shape, so everything downstream stays the same.
 */
export interface PaletteColor {
  hex: string;
  name: string;
}

export interface Region {
  id: string;
  /** SVG path data in viewBox coordinates. */
  d: string;
  /** 1-based index into the palette. */
  color: number;
}

export interface ColoringPage {
  id: string;
  title: string;
  /** e.g. "0 0 400 400" */
  viewBox: string;
  /** Palette entry i is color number i + 1. */
  palette: PaletteColor[];
  /** Painter's order: later regions sit on top of earlier ones. */
  regions: Region[];
  /** Outline width in screen pixels. */
  outlineWidth?: number;
}

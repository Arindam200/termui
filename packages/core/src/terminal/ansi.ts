/**
 * ANSI escape code utilities for terminal output.
 * Covers: colors, styles, cursor movement, screen control.
 */

// ESC character
const ESC = '\x1b';

// Reset
export const reset = `${ESC}[0m`;

// Text styles
export const bold = `${ESC}[1m`;
export const dim = `${ESC}[2m`;
export const italic = `${ESC}[3m`;
export const underline = `${ESC}[4m`;
export const blink = `${ESC}[5m`;
export const inverse = `${ESC}[7m`;
export const hidden = `${ESC}[8m`;
export const strikethrough = `${ESC}[9m`;

// Standard foreground colors (30–37)
export const fg = {
  black: `${ESC}[30m`,
  red: `${ESC}[31m`,
  green: `${ESC}[32m`,
  yellow: `${ESC}[33m`,
  blue: `${ESC}[34m`,
  magenta: `${ESC}[35m`,
  cyan: `${ESC}[36m`,
  white: `${ESC}[37m`,
  default: `${ESC}[39m`,
  // Bright variants (90–97)
  brightBlack: `${ESC}[90m`,
  brightRed: `${ESC}[91m`,
  brightGreen: `${ESC}[92m`,
  brightYellow: `${ESC}[93m`,
  brightBlue: `${ESC}[94m`,
  brightMagenta: `${ESC}[95m`,
  brightCyan: `${ESC}[96m`,
  brightWhite: `${ESC}[97m`,
} as const;

// Standard background colors (40–47)
export const bg = {
  black: `${ESC}[40m`,
  red: `${ESC}[41m`,
  green: `${ESC}[42m`,
  yellow: `${ESC}[43m`,
  blue: `${ESC}[44m`,
  magenta: `${ESC}[45m`,
  cyan: `${ESC}[46m`,
  white: `${ESC}[47m`,
  default: `${ESC}[49m`,
  // Bright backgrounds
  brightBlack: `${ESC}[100m`,
  brightRed: `${ESC}[101m`,
  brightGreen: `${ESC}[102m`,
  brightYellow: `${ESC}[103m`,
  brightBlue: `${ESC}[104m`,
  brightMagenta: `${ESC}[105m`,
  brightCyan: `${ESC}[106m`,
  brightWhite: `${ESC}[107m`,
} as const;

/** 256-color foreground: \x1b[38;5;<n>m */
export function fg256(n: number): string {
  return `${ESC}[38;5;${n}m`;
}

/** 256-color background: \x1b[48;5;<n>m */
export function bg256(n: number): string {
  return `${ESC}[48;5;${n}m`;
}

/** True-color (24-bit) foreground: \x1b[38;2;<r>;<g>;<b>m */
export function fgRgb(r: number, g: number, b: number): string {
  return `${ESC}[38;2;${r};${g};${b}m`;
}

/** True-color (24-bit) background: \x1b[48;2;<r>;<g>;<b>m */
export function bgRgb(r: number, g: number, b: number): string {
  return `${ESC}[48;2;${r};${g};${b}m`;
}

/** Parse a hex color string (#RRGGBB or #RGB) into {r,g,b} */
export function parseHex(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b };
  }
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return { r, g, b };
}

/** Apply true-color foreground from a hex string */
export function fgHex(hex: string): string {
  const { r, g, b } = parseHex(hex);
  return fgRgb(r, g, b);
}

/** Apply true-color background from a hex string */
export function bgHex(hex: string): string {
  const { r, g, b } = parseHex(hex);
  return bgRgb(r, g, b);
}

// Cursor movement
export const cursor = {
  up: (n = 1) => `${ESC}[${n}A`,
  down: (n = 1) => `${ESC}[${n}B`,
  forward: (n = 1) => `${ESC}[${n}C`,
  back: (n = 1) => `${ESC}[${n}D`,
  nextLine: (n = 1) => `${ESC}[${n}E`,
  prevLine: (n = 1) => `${ESC}[${n}F`,
  column: (n = 1) => `${ESC}[${n}G`,
  position: (row: number, col: number) => `${ESC}[${row};${col}H`,
  hide: `${ESC}[?25l`,
  show: `${ESC}[?25h`,
  save: `${ESC}[s`,
  restore: `${ESC}[u`,
} as const;

// Screen control
export const screen = {
  clear: `${ESC}[2J`,
  clearToEnd: `${ESC}[0J`,
  clearToStart: `${ESC}[1J`,
  clearLine: `${ESC}[2K`,
  clearLineToEnd: `${ESC}[0K`,
  clearLineToStart: `${ESC}[1K`,
  alternateBuffer: `${ESC}[?1049h`,
  mainBuffer: `${ESC}[?1049l`,
} as const;

// OSC (Operating System Command) sequences
export const osc = {
  /** OSC 8 — hyperlink: \x1b]8;;url\x1b\\ text \x1b]8;;\x1b\\ */
  hyperlink: (url: string, text: string) => `${ESC}]8;;${url}${ESC}\\${text}${ESC}]8;;${ESC}\\`,
  /** OSC 52 — clipboard write (base64-encoded) */
  clipboardWrite: (data: string) => {
    const encoded = Buffer.from(data).toString('base64');
    return `${ESC}]52;c;${encoded}\x07`;
  },
  /** OSC 0 — set window title */
  setTitle: (title: string) => `${ESC}]0;${title}\x07`,
} as const;

/** Wrap text with a style and reset */
export function style(code: string, text: string): string {
  return `${code}${text}${reset}`;
}

/** Strip all ANSI escape sequences from a string */
// We implement a fast inline stripper here;
// consumers should prefer the 'strip-ansi' package for full coverage
const ANSI_REGEX = /\x1b\[[0-9;]*[mGKHFABCDJn]|\x1b\][^\\]*\x1b\\|\x1b[()][AB012]/g;
export function stripAnsi(str: string): string {
  return str.replace(ANSI_REGEX, '');
}

/** Measure visible width of a string (strips ANSI first) */
export function visibleWidth(str: string): number {
  return stripAnsi(str).length;
}

// ─── Color depth downsampling ─────────────────────────────────────────────────

export type ColorDepth = 'truecolor' | '256' | '16' | 'none';

/**
 * The 16 standard ANSI terminal colors as approximate RGB values.
 * Indices 0-7 = standard, 8-15 = bright.
 */
const ANSI16_PALETTE: [number, number, number][] = [
  [  0,   0,   0], // 0  black
  [170,   0,   0], // 1  red
  [  0, 170,   0], // 2  green
  [170, 170,   0], // 3  yellow
  [  0,   0, 170], // 4  blue
  [170,   0, 170], // 5  magenta
  [  0, 170, 170], // 6  cyan
  [170, 170, 170], // 7  white (light gray)
  [ 85,  85,  85], // 8  bright black (dark gray)
  [255,  85,  85], // 9  bright red
  [ 85, 255,  85], // 10 bright green
  [255, 255,  85], // 11 bright yellow
  [ 85,  85, 255], // 12 bright blue
  [255,  85, 255], // 13 bright magenta
  [ 85, 255, 255], // 14 bright cyan
  [255, 255, 255], // 15 bright white
];

/** Euclidean distance² in RGB space (no sqrt — only used for comparison). */
function colorDist(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2;
}

/**
 * Map an RGB triplet to the nearest xterm 256-color palette index (0–255).
 *
 * Uses:
 *  - Indices 0–15:  standard + bright ANSI colors
 *  - Indices 16–231: 6×6×6 color cube  (index = 16 + 36r + 6g + b, r/g/b ∈ [0,5])
 *  - Indices 232–255: 24-step grayscale ramp
 */
export function nearestAnsi256(r: number, g: number, b: number): number {
  // Map to the 6×6×6 color cube
  const cr = Math.round(r / 255 * 5);
  const cg = Math.round(g / 255 * 5);
  const cb = Math.round(b / 255 * 5);
  const cubeIndex = 16 + 36 * cr + 6 * cg + cb;
  // Actual RGB of the chosen cube cell
  const cubeR = cr === 0 ? 0 : 55 + cr * 40;
  const cubeG = cg === 0 ? 0 : 55 + cg * 40;
  const cubeB = cb === 0 ? 0 : 55 + cb * 40;
  const cubeDist = colorDist(r, g, b, cubeR, cubeG, cubeB);

  // Map to the grayscale ramp (232–255)
  const avg = Math.round((r + g + b) / 3);
  const greyIndex = avg < 8 ? 232 : avg > 238 ? 255 : Math.round((avg - 8) / 247 * 23) + 232;
  const greyLevel = (greyIndex - 232) * 10 + 8;
  const greyDist = colorDist(r, g, b, greyLevel, greyLevel, greyLevel);

  return greyDist < cubeDist ? greyIndex : cubeIndex;
}

/**
 * Map an RGB triplet to the nearest 16-color ANSI palette index (0–15).
 * Used when the terminal reports `TERM=ansi` or only 16-color support.
 */
export function nearestAnsi16(r: number, g: number, b: number): number {
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < ANSI16_PALETTE.length; i++) {
    const [pr, pg, pb] = ANSI16_PALETTE[i]!;
    const d = colorDist(r, g, b, pr, pg, pb);
    if (d < bestDist) { bestDist = d; bestIdx = i; }
  }
  return bestIdx;
}

/**
 * Convert a hex color string to the appropriate ANSI foreground escape code
 * based on the given color depth.
 *
 * - `'truecolor'` — `\x1b[38;2;R;G;Bm`  (24-bit, pass-through)
 * - `'256'`       — `\x1b[38;5;Nm`       (nearest xterm-256 index)
 * - `'16'`        — `\x1b[3Nm` / `\x1b[9Nm` (nearest 16-color ANSI)
 * - `'none'`      — empty string (no color)
 *
 * @param hex   Color string in `#RRGGBB` or `#RGB` format.
 * @param depth Target color depth.
 */
export function downsampleColor(hex: string, depth: ColorDepth): string {
  if (depth === 'none') return '';
  const { r, g, b } = parseHex(hex);
  if (depth === 'truecolor') return fgRgb(r, g, b);
  if (depth === '256') return fg256(nearestAnsi256(r, g, b));
  // 16-color: indices 0-7 use \x1b[3Nm, indices 8-15 use \x1b[9(N-8)m
  const idx = nearestAnsi16(r, g, b);
  return idx < 8 ? `${ESC}[3${idx}m` : `${ESC}[9${idx - 8}m`;
}


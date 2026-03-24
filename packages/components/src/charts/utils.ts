/** Clamp a value between min and max (inclusive). */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Normalize a value to a 0-based row/level index within [0, levels-1]. */
export function normalize(value: number, min: number, max: number, levels: number): number {
  if (max === min) return Math.floor(levels / 2);
  return Math.round(((value - min) / (max - min)) * (levels - 1));
}

/** Pad a string to length on the right (truncates if too long). */
export function padEnd(str: string, length: number): string {
  if (str.length >= length) return str.slice(0, length);
  return str + ' '.repeat(length - str.length);
}

/** Pad a string to length on the left (truncates if too long). */
export function padStart(str: string, length: number): string {
  if (str.length >= length) return str.slice(0, length);
  return ' '.repeat(length - str.length) + str;
}

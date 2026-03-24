/** Zero-pad a number to `len` digits. */
export function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0');
}

/**
 * Format milliseconds as HH:MM:SS.cc (centiseconds).
 * Used by Stopwatch.
 */
export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const centis = Math.floor((ms % 1000) / 10);
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(centis)}`;
}

/**
 * Format whole seconds as a time string.
 * - 'hms' → HH:MM:SS
 * - 'ms'  → MM:SS
 * - 's'   → Xs
 * Used by Timer.
 */
export function formatTime(seconds: number, format: 'hms' | 'ms' | 's'): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (format === 's') return `${seconds}s`;
  if (format === 'ms') return `${pad(m)}:${pad(s)}`;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

import type { Theme } from './tokens.js';

/**
 * Calculate relative luminance of a hex color (WCAG 2.1 formula).
 * Returns a value between 0 (darkest) and 1 (lightest).
 */
export function luminance(hex: string): number {
  const clean = hex.replace('#', '');

  let r: number, g: number, b: number;

  if (clean.length === 3) {
    r = parseInt(clean[0]! + clean[0]!, 16);
    g = parseInt(clean[1]! + clean[1]!, 16);
    b = parseInt(clean[2]! + clean[2]!, 16);
  } else {
    r = parseInt(clean.slice(0, 2), 16);
    g = parseInt(clean.slice(2, 4), 16);
    b = parseInt(clean.slice(4, 6), 16);
  }

  function linearize(channel: number): number {
    const sRGB = channel / 255;
    return sRGB <= 0.04045 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  }

  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Calculate contrast ratio between two hex colors (WCAG 2.1).
 * Returns a value between 1 (no contrast) and 21 (max contrast).
 */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export type ContrastLevel = 'fail' | 'AA-large' | 'AA' | 'AAA';

/**
 * Get WCAG contrast level for a foreground/background pair.
 * AAA >= 7:1, AA >= 4.5:1, AA-large >= 3:1, fail < 3:1
 */
export function wcagLevel(hex1: string, hex2: string): ContrastLevel {
  const ratio = contrastRatio(hex1, hex2);
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA-large';
  return 'fail';
}

export interface ContrastReport {
  pair: [string, string];
  ratio: number;
  level: ContrastLevel;
}

/**
 * Validate all critical color pairs in a theme and return a report.
 * Checks: foreground/background, primary/background, error/background, etc.
 */
export function validateThemeContrast(theme: Theme): ContrastReport[] {
  const bg = theme.colors.background;

  const pairs: Array<[string, string, string]> = [
    ['foreground', theme.colors.foreground, bg],
    ['primary', theme.colors.primary, bg],
    ['secondary', theme.colors.secondary, bg],
    ['accent', theme.colors.accent, bg],
    ['error', theme.colors.error, bg],
    ['warning', theme.colors.warning, bg],
    ['success', theme.colors.success, bg],
    ['info', theme.colors.info, bg],
    ['mutedForeground', theme.colors.mutedForeground, bg],
    ['primaryForeground on primary', theme.colors.primaryForeground, theme.colors.primary],
    ['errorForeground on error', theme.colors.errorForeground, theme.colors.error],
    ['successForeground on success', theme.colors.successForeground, theme.colors.success],
    ['selectionForeground on selection', theme.colors.selectionForeground, theme.colors.selection],
  ];

  return pairs.map(([, fg, bgColor]) => {
    const ratio = contrastRatio(fg, bgColor);
    const level = wcagLevel(fg, bgColor);
    return {
      pair: [fg, bgColor] as [string, string],
      ratio: Math.round(ratio * 100) / 100,
      level,
    };
  });
}

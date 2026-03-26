/**
 * Border character resolution with ASCII fallback for terminals
 * that don't support box-drawing characters.
 */

import { getTerminalCapabilities } from './capabilities.js';

export type BorderMode = 'unicode' | 'ascii' | 'auto';

export interface BorderChars {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  vertical: string;
  teeLeft: string;
  teeRight: string;
  teeTop: string;
  teeBottom: string;
  cross: string;
}

const UNICODE_BORDERS: BorderChars = {
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
  horizontal: '─',
  vertical: '│',
  teeLeft: '├',
  teeRight: '┤',
  teeTop: '┬',
  teeBottom: '┴',
  cross: '┼',
};

const ASCII_BORDERS: BorderChars = {
  topLeft: '+',
  topRight: '+',
  bottomLeft: '+',
  bottomRight: '+',
  horizontal: '-',
  vertical: '|',
  teeLeft: '+',
  teeRight: '+',
  teeTop: '+',
  teeBottom: '+',
  cross: '+',
};

/**
 * Get the appropriate border characters based on terminal capabilities.
 *
 * @param mode - 'unicode' | 'ascii' | 'auto' (default: 'auto')
 */
export function getBorderChars(mode: BorderMode = 'auto'): BorderChars {
  if (mode === 'unicode') return UNICODE_BORDERS;
  if (mode === 'ascii') return ASCII_BORDERS;
  // auto: check capabilities
  const caps = getTerminalCapabilities();
  return caps.supportsUnicode ? UNICODE_BORDERS : ASCII_BORDERS;
}

/**
 * Resolve a border style string to its character representation.
 * When `ascii` mode is active, box-drawing characters are replaced.
 */
export function resolveBoxBorder(inkBorderStyle: string, mode: BorderMode = 'auto'): string {
  if (mode === 'unicode') return inkBorderStyle;
  if (mode === 'ascii') return 'classic'; // Ink's ASCII-compatible style
  const caps = getTerminalCapabilities();
  return caps.supportsUnicode ? inkBorderStyle : 'classic';
}

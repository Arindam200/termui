/**
 * termui/picocolors adapter — superset of picocolors API using ANSI escape codes.
 * Respects NO_COLOR, FORCE_COLOR, CLICOLOR (via shared color-env detection).
 */

import { isColorEnabled } from '../internal/color-env.js';

function wrap(open: number, close: number) {
  return (str: string): string => {
    if (!isColorEnabled()) return str;
    return `\x1b[${open}m${str}\x1b[${close}m`;
  };
}

function wrapBg(open: number, close: number) {
  return (str: string): string => {
    if (!isColorEnabled()) return str;
    return `\x1b[${open}m${str}\x1b[${close}m`;
  };
}

export const pc = {
  // Modifiers
  reset: wrap(0, 0),
  bold: wrap(1, 22),
  dim: wrap(2, 22),
  italic: wrap(3, 23),
  underline: wrap(4, 24),
  inverse: wrap(7, 27),
  hidden: wrap(8, 28),
  strikethrough: wrap(9, 29),

  // Foreground colors
  black: wrap(30, 39),
  red: wrap(31, 39),
  green: wrap(32, 39),
  yellow: wrap(33, 39),
  blue: wrap(34, 39),
  magenta: wrap(35, 39),
  cyan: wrap(36, 39),
  white: wrap(37, 39),
  gray: wrap(90, 39),

  // Background colors
  bgBlack: wrapBg(40, 49),
  bgRed: wrapBg(41, 49),
  bgGreen: wrapBg(42, 49),
  bgYellow: wrapBg(43, 49),
  bgBlue: wrapBg(44, 49),
  bgMagenta: wrapBg(45, 49),
  bgCyan: wrapBg(46, 49),
  bgWhite: wrapBg(47, 49),

  // Extensions
  hex(color: string): (str: string) => string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return (str: string): string => {
      if (!isColorEnabled()) return str;
      return `\x1b[38;2;${r};${g};${b}m${str}\x1b[39m`;
    };
  },

  ansi256(code: number): (str: string) => string {
    return (str: string): string => {
      if (!isColorEnabled()) return str;
      return `\x1b[38;5;${code}m${str}\x1b[39m`;
    };
  },
};

export default pc;

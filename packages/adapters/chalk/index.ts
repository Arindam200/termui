/**
 * termui/chalk adapter — chalk-compatible color API using ANSI escape codes.
 * Built-in implementation; no chalk peer dep required at runtime.
 * Respects NO_COLOR, FORCE_COLOR, CLICOLOR (via shared color-env detection).
 * Supports chainable API via Proxy: chalk.bold.red('text')
 */

import { isColorEnabled } from '../internal/color-env.js';

// ANSI open/close code pairs
const STYLES: Record<string, [number, number]> = {
  // Modifiers
  reset: [0, 0],
  bold: [1, 22],
  dim: [2, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  hidden: [8, 28],
  strikethrough: [9, 29],

  // Foreground colors
  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39],
  gray: [90, 39],
  grey: [90, 39],

  // Bright foreground
  blackBright: [90, 39],
  redBright: [91, 39],
  greenBright: [92, 39],
  yellowBright: [93, 39],
  blueBright: [94, 39],
  magentaBright: [95, 39],
  cyanBright: [96, 39],
  whiteBright: [97, 39],

  // Background colors
  bgBlack: [40, 49],
  bgRed: [41, 49],
  bgGreen: [42, 49],
  bgYellow: [43, 49],
  bgBlue: [44, 49],
  bgMagenta: [45, 49],
  bgCyan: [46, 49],
  bgWhite: [47, 49],

  // Bright background
  bgBlackBright: [100, 49],
  bgRedBright: [101, 49],
  bgGreenBright: [102, 49],
  bgYellowBright: [103, 49],
  bgBlueBright: [104, 49],
  bgMagentaBright: [105, 49],
  bgCyanBright: [106, 49],
  bgWhiteBright: [107, 49],
};

// Chalk instance type — callable + chainable property access
export interface ChalkInstance {
  (text: string): string;
  // Modifiers
  reset: ChalkInstance;
  bold: ChalkInstance;
  dim: ChalkInstance;
  italic: ChalkInstance;
  underline: ChalkInstance;
  inverse: ChalkInstance;
  hidden: ChalkInstance;
  strikethrough: ChalkInstance;
  visible: ChalkInstance;
  // Foreground colors
  black: ChalkInstance;
  red: ChalkInstance;
  green: ChalkInstance;
  yellow: ChalkInstance;
  blue: ChalkInstance;
  magenta: ChalkInstance;
  cyan: ChalkInstance;
  white: ChalkInstance;
  gray: ChalkInstance;
  grey: ChalkInstance;
  blackBright: ChalkInstance;
  redBright: ChalkInstance;
  greenBright: ChalkInstance;
  yellowBright: ChalkInstance;
  blueBright: ChalkInstance;
  magentaBright: ChalkInstance;
  cyanBright: ChalkInstance;
  whiteBright: ChalkInstance;
  // Background colors
  bgBlack: ChalkInstance;
  bgRed: ChalkInstance;
  bgGreen: ChalkInstance;
  bgYellow: ChalkInstance;
  bgBlue: ChalkInstance;
  bgMagenta: ChalkInstance;
  bgCyan: ChalkInstance;
  bgWhite: ChalkInstance;
  bgBlackBright: ChalkInstance;
  bgRedBright: ChalkInstance;
  bgGreenBright: ChalkInstance;
  bgYellowBright: ChalkInstance;
  bgBlueBright: ChalkInstance;
  bgMagentaBright: ChalkInstance;
  bgCyanBright: ChalkInstance;
  bgWhiteBright: ChalkInstance;
  // Truecolor / 256-color methods
  rgb(r: number, g: number, b: number): ChalkInstance;
  bgRgb(r: number, g: number, b: number): ChalkInstance;
  hex(color: string): ChalkInstance;
  bgHex(color: string): ChalkInstance;
  ansi256(code: number): ChalkInstance;
  bgAnsi256(code: number): ChalkInstance;
  level: number;
}

// Internal representation for a chalk chain
interface ChalkState {
  // Pairs of [open, close] ANSI codes
  stack: Array<[string, number]>;
}

function applyStack(stack: Array<[string, number]>, text: string): string {
  if (!isColorEnabled()) return text;
  let result = text;
  for (let i = stack.length - 1; i >= 0; i--) {
    const pair = stack[i]!;
    result = `\x1b[${pair[0]}m${result}\x1b[${pair[1]}m`;
  }
  return result;
}

function parseHex(color: string): [number, number, number] {
  const clean = color.replace('#', '').padEnd(6, '0');
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  return [r, g, b];
}

function createChalk(stack: Array<[string, number]> = []): ChalkInstance {
  function chalkFn(text: string): string {
    return applyStack(stack, text);
  }

  const handler: ProxyHandler<typeof chalkFn> = {
    get(_target, prop: string | symbol): unknown {
      if (typeof prop !== 'string') return undefined;

      // Pass through native function properties
      if (prop === 'length' || prop === 'name' || prop === 'prototype') {
        return (_target as unknown as Record<string, unknown>)[prop];
      }

      if (prop === 'level') {
        return isColorEnabled() ? 3 : 0;
      }

      // visible — render only if color enabled
      if (prop === 'visible') {
        return createChalk(stack);
      }

      // Standard named style
      if (prop in STYLES) {
        const pair = STYLES[prop]!;
        return createChalk([...stack, [String(pair[0]), pair[1]]]);
      }

      // Truecolor / 256 builder methods — returned as functions
      if (prop === 'rgb') {
        return (r: number, g: number, b: number) =>
          createChalk([...stack, [`38;2;${r};${g};${b}`, 39]]);
      }
      if (prop === 'bgRgb') {
        return (r: number, g: number, b: number) =>
          createChalk([...stack, [`48;2;${r};${g};${b}`, 49]]);
      }
      if (prop === 'hex') {
        return (color: string) => {
          const [r, g, b] = parseHex(color);
          return createChalk([...stack, [`38;2;${r};${g};${b}`, 39]]);
        };
      }
      if (prop === 'bgHex') {
        return (color: string) => {
          const [r, g, b] = parseHex(color);
          return createChalk([...stack, [`48;2;${r};${g};${b}`, 49]]);
        };
      }
      if (prop === 'ansi256') {
        return (code: number) => createChalk([...stack, [`38;5;${code}`, 39]]);
      }
      if (prop === 'bgAnsi256') {
        return (code: number) => createChalk([...stack, [`48;5;${code}`, 49]]);
      }

      return undefined;
    },

    apply(_target, _thisArg, args: unknown[]): string {
      return chalkFn(String(args[0] ?? ''));
    },
  };

  return new Proxy(chalkFn, handler) as unknown as ChalkInstance;
}

export const chalk: ChalkInstance = createChalk();
export default chalk;

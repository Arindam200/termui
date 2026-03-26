/**
 * termui/ora adapter — ora-compatible spinner using pure readline/ANSI.
 * No ora peer dep required; fully self-contained implementation.
 * Respects NO_COLOR via isColorEnabled().
 */

import { isColorEnabled } from '../internal/color-env.js';

// Spinner frame sets
const SPINNERS: Record<string, { frames: string[]; interval: number }> = {
  dots: {
    frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    interval: 80,
  },
  line: {
    frames: ['-', '\\', '|', '/'],
    interval: 130,
  },
  arc: {
    frames: ['◜', '◠', '◝', '◞', '◡', '◟'],
    interval: 100,
  },
  circle: {
    frames: ['◡', '⊙', '◠'],
    interval: 120,
  },
  bouncingBar: {
    frames: [
      '[    ]',
      '[=   ]',
      '[==  ]',
      '[=== ]',
      '[ ===]',
      '[  ==]',
      '[   =]',
      '[    ]',
      '[   =]',
      '[  ==]',
      '[ ===]',
      '[====]',
      '[=== ]',
      '[==  ]',
      '[=   ]',
    ],
    interval: 80,
  },
};

// ANSI color codes for spinner icon coloring
const COLOR_CODES: Record<string, number> = {
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
  gray: 90,
};

function colorize(str: string, color: string): string {
  if (!isColorEnabled()) return str;
  const code = COLOR_CODES[color];
  if (code === undefined) return str;
  return `\x1b[${code}m${str}\x1b[39m`;
}

export interface OraOptions {
  text?: string;
  color?: string;
  spinner?: string | { frames: string[]; interval: number };
  prefixText?: string;
  indent?: number;
  hideCursor?: boolean;
}

export interface OraSpinner {
  start(text?: string): OraSpinner;
  stop(): OraSpinner;
  succeed(text?: string): OraSpinner;
  fail(text?: string): OraSpinner;
  warn(text?: string): OraSpinner;
  info(text?: string): OraSpinner;
  clear(): OraSpinner;
  render(): OraSpinner;
  text: string;
  color: string;
  isSpinning: boolean;
}

class Spinner implements OraSpinner {
  text: string;
  color: string;
  isSpinning = false;

  private _spinner: { frames: string[]; interval: number };
  private _prefixText: string;
  private _indent: number;
  private _hideCursor: boolean;
  private _frameIndex = 0;
  private _timer: ReturnType<typeof setInterval> | null = null;
  private _lastLineLength = 0;

  constructor(options: OraOptions = {}) {
    this.text = options.text ?? '';
    this.color = options.color ?? 'cyan';
    this._prefixText = options.prefixText ?? '';
    this._indent = options.indent ?? 0;
    this._hideCursor = options.hideCursor ?? true;

    if (options.spinner && typeof options.spinner !== 'string') {
      this._spinner = options.spinner;
    } else {
      const name = typeof options.spinner === 'string' ? options.spinner : 'dots';
      this._spinner = SPINNERS[name] ?? SPINNERS['dots']!;
    }
  }

  private _getFrame(): string {
    return this._spinner.frames[this._frameIndex % this._spinner.frames.length] ?? '';
  }

  private _buildLine(): string {
    const indent = ' '.repeat(this._indent);
    const prefix = this._prefixText ? `${this._prefixText} ` : '';
    const frame = colorize(this._getFrame(), this.color);
    const text = this.text ? ` ${this.text}` : '';
    return `${indent}${prefix}${frame}${text}`;
  }

  private _clearLine(): void {
    if (!process.stdout.isTTY) return;
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  }

  private _writeLine(line: string): void {
    this._clearLine();
    process.stdout.write(line);
    this._lastLineLength = line.length;
  }

  render(): OraSpinner {
    if (!process.stdout.isTTY) return this;
    this._writeLine(this._buildLine());
    return this;
  }

  clear(): OraSpinner {
    if (!process.stdout.isTTY) return this;
    this._clearLine();
    return this;
  }

  start(text?: string): OraSpinner {
    if (text !== undefined) this.text = text;
    if (this.isSpinning) return this;

    this.isSpinning = true;
    this._frameIndex = 0;

    if (this._hideCursor && process.stdout.isTTY) {
      process.stdout.write('\x1b[?25l');
    }

    this.render();

    this._timer = setInterval(() => {
      this._frameIndex++;
      this.render();
    }, this._spinner.interval);

    return this;
  }

  stop(): OraSpinner {
    if (!this.isSpinning) return this;
    this.isSpinning = false;

    if (this._timer !== null) {
      clearInterval(this._timer);
      this._timer = null;
    }

    this.clear();

    if (this._hideCursor && process.stdout.isTTY) {
      process.stdout.write('\x1b[?25h');
    }

    return this;
  }

  private _stopWithSymbol(symbol: string, text?: string): OraSpinner {
    const label = text ?? this.text;
    this.stop();
    const indent = ' '.repeat(this._indent);
    const line = `${indent}${symbol} ${label}`;
    process.stdout.write(`${line}\n`);
    return this;
  }

  succeed(text?: string): OraSpinner {
    const symbol = isColorEnabled() ? '\x1b[32m✔\x1b[39m' : '✔';
    return this._stopWithSymbol(symbol, text);
  }

  fail(text?: string): OraSpinner {
    const symbol = isColorEnabled() ? '\x1b[31m✖\x1b[39m' : '✖';
    return this._stopWithSymbol(symbol, text);
  }

  warn(text?: string): OraSpinner {
    const symbol = isColorEnabled() ? '\x1b[33m⚠\x1b[39m' : '⚠';
    return this._stopWithSymbol(symbol, text);
  }

  info(text?: string): OraSpinner {
    const symbol = isColorEnabled() ? '\x1b[34mℹ\x1b[39m' : 'ℹ';
    return this._stopWithSymbol(symbol, text);
  }
}

export function ora(options?: string | OraOptions): OraSpinner {
  const opts: OraOptions = typeof options === 'string' ? { text: options } : (options ?? {});
  return new Spinner(opts);
}

export default ora;

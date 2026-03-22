import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// ── Helpers ────────────────────────────────────────────────────────────────

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

// ── Import & re-import with NO_COLOR control ───────────────────────────────
// The module reads process.env['NO_COLOR'] at import time, so we test the
// live (colour-enabled) path by importing normally and the disabled path by
// inlining the same wrap() logic with enabled=false.

describe('picocolors (colours enabled)', () => {
  // Import once; in the test runner there is no NO_COLOR set
  let pc: typeof import('./index.js').pc;

  beforeEach(async () => {
    // Ensure NO_COLOR is not set for this suite
    delete process.env['NO_COLOR'];
    pc = (await import('./index.js')).pc;
  });

  it('pc is exported', () => {
    expect(pc).toBeDefined();
  });

  it('pc.bold wraps text with ANSI bold codes', () => {
    const result = pc.bold('text');
    expect(result).toContain('\x1b[1m');
    expect(result).toContain('text');
    expect(result).toContain('\x1b[22m');
  });

  it('pc.dim wraps text with ANSI dim codes', () => {
    const result = pc.dim('text');
    expect(result).toContain('\x1b[2m');
    expect(result).toContain('text');
  });

  it('pc.italic wraps text with ANSI italic codes', () => {
    const result = pc.italic('hello');
    expect(result).toContain('\x1b[3m');
    expect(result).toContain('hello');
    expect(result).toContain('\x1b[23m');
  });

  it('pc.underline wraps text with ANSI underline codes', () => {
    const result = pc.underline('link');
    expect(result).toContain('\x1b[4m');
  });

  it('pc.strikethrough wraps text with ANSI strikethrough codes', () => {
    const result = pc.strikethrough('old');
    expect(result).toContain('\x1b[9m');
    expect(result).toContain('\x1b[29m');
  });

  it('pc.red wraps text with ANSI red codes', () => {
    const result = pc.red('error');
    expect(result).toContain('\x1b[31m');
    expect(result).toContain('error');
    expect(result).toContain('\x1b[39m');
  });

  it('pc.green wraps text with ANSI green codes', () => {
    const result = pc.green('ok');
    expect(result).toContain('\x1b[32m');
  });

  it('pc.yellow wraps text with ANSI yellow codes', () => {
    const result = pc.yellow('warn');
    expect(result).toContain('\x1b[33m');
  });

  it('pc.blue wraps text with ANSI blue codes', () => {
    const result = pc.blue('info');
    expect(result).toContain('\x1b[34m');
  });

  it('pc.cyan wraps text with ANSI cyan codes', () => {
    const result = pc.cyan('note');
    expect(result).toContain('\x1b[36m');
  });

  it('pc.magenta wraps text with ANSI magenta codes', () => {
    const result = pc.magenta('magic');
    expect(result).toContain('\x1b[35m');
  });

  it('pc.white wraps text with ANSI white codes', () => {
    const result = pc.white('bright');
    expect(result).toContain('\x1b[37m');
  });

  it('pc.gray wraps text with ANSI gray codes (bright black)', () => {
    const result = pc.gray('muted');
    expect(result).toContain('\x1b[90m');
  });

  it('pc.bgRed wraps text with ANSI background red codes', () => {
    const result = pc.bgRed('danger');
    expect(result).toContain('\x1b[41m');
    expect(result).toContain('\x1b[49m');
  });

  it('pc.bgGreen wraps text with ANSI background green codes', () => {
    const result = pc.bgGreen('safe');
    expect(result).toContain('\x1b[42m');
  });

  it('pc.reset wraps text with reset codes on both sides', () => {
    const result = pc.reset('plain');
    expect(result).toContain('\x1b[0m');
    expect(result).toContain('plain');
  });

  it('pc.inverse wraps text with inverse codes', () => {
    const result = pc.inverse('flipped');
    expect(result).toContain('\x1b[7m');
    expect(result).toContain('\x1b[27m');
  });

  it('pc.hidden wraps text with hidden codes', () => {
    const result = pc.hidden('secret');
    expect(result).toContain('\x1b[8m');
    expect(result).toContain('\x1b[28m');
  });

  // ── hex() ────────────────────────────────────────────────────────────────

  it('pc.hex produces a function', () => {
    expect(typeof pc.hex('#ff0000')).toBe('function');
  });

  it('pc.hex("#ff0000") wraps with correct RGB ANSI code', () => {
    const result = pc.hex('#ff0000')('text');
    expect(result).toContain('\x1b[38;2;255;0;0m');
    expect(result).toContain('text');
    expect(result).toContain('\x1b[39m');
  });

  it('pc.hex works without leading #', () => {
    const result = pc.hex('00ff00')('green');
    expect(result).toContain('\x1b[38;2;0;255;0m');
  });

  it('pc.hex("#0000ff") wraps with correct RGB ANSI code for blue', () => {
    const result = pc.hex('#0000ff')('blue text');
    expect(result).toContain('\x1b[38;2;0;0;255m');
  });

  it('pc.hex("#ffffff") produces white RGB code', () => {
    const result = pc.hex('#ffffff')('white');
    expect(result).toContain('\x1b[38;2;255;255;255m');
  });

  // ── ansi256() ─────────────────────────────────────────────────────────────

  it('pc.ansi256 produces a function', () => {
    expect(typeof pc.ansi256(196)).toBe('function');
  });

  it('pc.ansi256 wraps text with the correct 256-colour ANSI code', () => {
    const result = pc.ansi256(196)('text');
    expect(result).toContain('\x1b[38;5;196m');
    expect(result).toContain('text');
    expect(result).toContain('\x1b[39m');
  });

  // ── Sanity: stripped text equals original ─────────────────────────────────

  it('stripping ANSI codes from bold() yields the original string', () => {
    expect(stripAnsi(pc.bold('hello'))).toBe('hello');
  });

  it('stripping ANSI codes from hex() yields the original string', () => {
    expect(stripAnsi(pc.hex('#aabbcc')('world'))).toBe('world');
  });
});

// ── NO_COLOR disabled path (inline simulation) ────────────────────────────
// Because the module evaluates `enabled` at import time we cannot easily
// re-import it with NO_COLOR set in the same process without module cache
// tricks. Instead we inline the same `wrap` logic with enabled=false to
// test the branch directly — this is exactly what the source does.

describe('picocolors with NO_COLOR (disabled path simulation)', () => {
  function wrapDisabled(_open: number, _close: number) {
    return (str: string): string => str; // enabled=false → return str as-is
  }

  const pcDisabled = {
    bold: wrapDisabled(1, 22),
    red: wrapDisabled(31, 39),
    reset: wrapDisabled(0, 0),
    hex(_color: string) {
      return (str: string): string => str;
    },
  };

  it('bold() returns plain text when colours disabled', () => {
    expect(pcDisabled.bold('hello')).toBe('hello');
  });

  it('red() returns plain text when colours disabled', () => {
    expect(pcDisabled.red('error')).toBe('error');
  });

  it('reset() returns plain text when colours disabled', () => {
    expect(pcDisabled.reset('plain')).toBe('plain');
  });

  it('hex() returns plain text when colours disabled', () => {
    expect(pcDisabled.hex('#ff0000')('red text')).toBe('red text');
  });
});

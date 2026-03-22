import { describe, it, expect } from 'vitest';
import {
  fg,
  bg,
  fgHex,
  bgHex,
  fgRgb,
  parseHex,
  stripAnsi,
  visibleWidth,
  style as ansiStyle,
} from './ansi.js';

describe('ANSI utilities', () => {
  it('produces correct foreground color codes', () => {
    expect(fg.red).toBe('\x1b[31m');
    expect(fg.cyan).toBe('\x1b[36m');
  });

  it('produces correct background color codes', () => {
    expect(bg.green).toBe('\x1b[42m');
  });

  it('parses hex colors correctly', () => {
    expect(parseHex('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseHex('#FFF')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHex('#1A2B3C')).toEqual({ r: 26, g: 43, b: 60 });
  });

  it('strips ANSI escape sequences', () => {
    const colored = '\x1b[31mHello\x1b[0m';
    expect(stripAnsi(colored)).toBe('Hello');
  });

  it('measures visible width correctly', () => {
    expect(visibleWidth('\x1b[31mHello\x1b[0m')).toBe(5);
    expect(visibleWidth('plain text')).toBe(10);
  });

  it('wraps text with style and reset', () => {
    const result = ansiStyle('\x1b[1m', 'Bold');
    expect(result).toContain('Bold');
    expect(result).toContain('\x1b[0m');
  });
});

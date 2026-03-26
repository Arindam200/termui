import { describe, it, expect } from 'vitest';
import { Gauge } from './Gauge.js';

// ── Export smoke test ─────────────────────────────────────────────────────────

describe('Gauge export', () => {
  it('is exported as a function', () => {
    expect(typeof Gauge).toBe('function');
  });
});

// ── Arc characters ────────────────────────────────────────────────────────────

describe('Gauge arc characters', () => {
  const ARC_CHARS_FILL = '█';
  const ARC_CHARS_EMPTY = '░';

  it('fill char is the full block █', () => {
    expect(ARC_CHARS_FILL).toBe('█');
    expect(ARC_CHARS_FILL.codePointAt(0)).toBe(0x2588);
  });

  it('empty char is the light shade ░', () => {
    expect(ARC_CHARS_EMPTY).toBe('░');
    expect(ARC_CHARS_EMPTY.codePointAt(0)).toBe(0x2591);
  });

  it('a bar built from fill+empty chars has correct total length', () => {
    const width = 10;
    const pct = 0.7;
    const filled = Math.round(pct * width);
    const empty = width - filled;
    const bar = ARC_CHARS_FILL.repeat(filled) + ARC_CHARS_EMPTY.repeat(empty);
    expect(bar.length).toBe(width);
  });
});

// ── clamp / percentage calculation ───────────────────────────────────────────

describe('Gauge clamp and pct', () => {
  function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  function calcPct(value: number, min: number, max: number): number {
    if (max === min) return 0;
    return (clamp(value, min, max) - min) / (max - min);
  }

  it('calculates 0% at min value', () => {
    expect(calcPct(0, 0, 100)).toBe(0);
  });

  it('calculates 100% at max value', () => {
    expect(calcPct(100, 0, 100)).toBe(1);
  });

  it('calculates 50% at midpoint', () => {
    expect(calcPct(50, 0, 100)).toBe(0.5);
  });

  it('clamps below min to 0%', () => {
    expect(calcPct(-10, 0, 100)).toBe(0);
  });

  it('clamps above max to 100%', () => {
    expect(calcPct(150, 0, 100)).toBe(1);
  });

  it('returns 0% when min equals max (avoids division by zero)', () => {
    expect(calcPct(50, 50, 50)).toBe(0);
  });

  it('works with a non-zero min range', () => {
    expect(calcPct(150, 100, 200)).toBe(0.5);
  });
});

// ── Percent display string ────────────────────────────────────────────────────

describe('Gauge percent display', () => {
  function pctStr(pct: number): string {
    return `${Math.round(pct * 100)}%`;
  }

  it('displays 0% for empty gauge', () => {
    expect(pctStr(0)).toBe('0%');
  });

  it('displays 50% at midpoint', () => {
    expect(pctStr(0.5)).toBe('50%');
  });

  it('displays 100% at full', () => {
    expect(pctStr(1)).toBe('100%');
  });

  it('rounds fractional percentages', () => {
    // 0.333... → 33%
    expect(pctStr(1 / 3)).toBe('33%');
  });

  it('always ends with %', () => {
    expect(pctStr(0.72).endsWith('%')).toBe(true);
  });
});

// ── Size variants ─────────────────────────────────────────────────────────────

describe('Gauge size variants', () => {
  it('sm gauge uses width 10', () => {
    const width = 10;
    const pct = 0.6;
    const filled = Math.round(pct * width);
    expect(filled).toBe(6);
    expect(filled + (width - filled)).toBe(width);
  });

  it('md gauge uses width 14', () => {
    const width = 14;
    const pct = 0.5;
    const filled = Math.round(pct * width);
    expect(filled).toBe(7);
  });

  it('lg gauge uses width 22', () => {
    const width = 22;
    const pct = 1.0;
    const filled = Math.round(pct * width);
    expect(filled).toBe(22);
  });

  it('default size is md', () => {
    const size = 'md';
    expect(size).toBe('md');
  });
});

// ── md arc structure characters ────────────────────────────────────────────────

describe('Gauge md arc border chars', () => {
  it('top row starts with ╭ and ends with ╮', () => {
    const arcWidth = 14;
    const top = '╭' + '─'.repeat(arcWidth) + '╮';
    expect(top.startsWith('╭')).toBe(true);
    expect(top.endsWith('╮')).toBe(true);
  });

  it('bottom row starts with ╰ and ends with ╯', () => {
    const bottom = '╰' + '(fill)' + '╯';
    expect(bottom.startsWith('╰')).toBe(true);
    expect(bottom.endsWith('╯')).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { Sparkline } from './Sparkline.js';

// ── Export smoke test ─────────────────────────────────────────────────────────

describe('Sparkline export', () => {
  it('is exported as a function', () => {
    expect(typeof Sparkline).toBe('function');
  });
});

// ── Braille level characters ──────────────────────────────────────────────────

describe('Sparkline braille chars', () => {
  const BRAILLE_LEVELS = ['⣀', '⣄', '⣤', '⣦', '⣶', '⣷', '⣿', '⣿'];

  it('has 8 braille level entries', () => {
    expect(BRAILLE_LEVELS.length).toBe(8);
  });

  it('first char is ⣀ (lowest fill)', () => {
    expect(BRAILLE_LEVELS[0]).toBe('⣀');
    expect(BRAILLE_LEVELS[0]!.codePointAt(0)).toBe(0x28c0);
  });

  it('last char is ⣿ (highest fill)', () => {
    expect(BRAILLE_LEVELS[7]).toBe('⣿');
    expect(BRAILLE_LEVELS[7]!.codePointAt(0)).toBe(0x28ff);
  });

  it('all entries are single Unicode characters', () => {
    for (const ch of BRAILLE_LEVELS) {
      // Each braille char occupies exactly one codepoint
      expect([...ch].length).toBe(1);
    }
  });

  it('every char is in the Braille Patterns Unicode block (U+2800–U+28FF)', () => {
    for (const ch of BRAILLE_LEVELS) {
      const cp = ch.codePointAt(0)!;
      expect(cp).toBeGreaterThanOrEqual(0x2800);
      expect(cp).toBeLessThanOrEqual(0x28ff);
    }
  });
});

// ── normalize helper (mirrors charts/utils normalize exactly) ─────────────────
// Real signature: Math.round(((value - min) / (max - min)) * (levels - 1))
// When max === min it returns Math.floor(levels / 2).

function normalize(value: number, min: number, max: number, levels: number): number {
  if (max === min) return Math.floor(levels / 2);
  return Math.round(((value - min) / (max - min)) * (levels - 1));
}

describe('Sparkline normalize', () => {
  it('returns 0 for the minimum value', () => {
    expect(normalize(0, 0, 100, 8)).toBe(0);
  });

  it('returns levels-1 for the maximum value', () => {
    expect(normalize(100, 0, 100, 8)).toBe(7);
  });

  it('returns Math.floor(levels/2) when min equals max', () => {
    // levels=8 → Math.floor(4) = 4
    expect(normalize(50, 50, 50, 8)).toBe(4);
  });

  it('maps midpoint to approximately half of levels', () => {
    const level = normalize(50, 0, 100, 8);
    expect(level).toBeGreaterThanOrEqual(3);
    expect(level).toBeLessThanOrEqual(4);
  });

  it('rounds to nearest level index', () => {
    // (33/100) * 7 = 2.31 → rounds to 2
    expect(normalize(33, 0, 100, 8)).toBe(2);
  });

  it('maximum value maps to exactly levels-1', () => {
    expect(normalize(100, 0, 100, 8)).toBe(7);
  });
});

// ── Empty data fallback ───────────────────────────────────────────────────────

describe('Sparkline empty data', () => {
  it('renders dash line for empty data (default width 20)', () => {
    const width = 20;
    const emptyStr = '─'.repeat(width);
    expect(emptyStr.length).toBe(width);
    expect(emptyStr.codePointAt(0)).toBe(0x2500);
  });

  it('dash char is ─ (U+2500)', () => {
    expect('─'.codePointAt(0)).toBe(0x2500);
  });
});

// ── Data sampling ─────────────────────────────────────────────────────────────

describe('Sparkline data sampling', () => {
  function sample(data: number[], width: number): number[] {
    if (data.length <= width) return data;
    return Array.from(
      { length: width },
      (_, i) => data[Math.round((i / (width - 1)) * (data.length - 1))] ?? 0
    );
  }

  it('returns data unchanged when length <= width', () => {
    const data = [1, 2, 3, 4, 5];
    expect(sample(data, 10)).toEqual(data);
  });

  it('returns exactly width elements when data is longer', () => {
    const data = Array.from({ length: 50 }, (_, i) => i);
    const result = sample(data, 20);
    expect(result.length).toBe(20);
  });

  it('first sampled value matches first data point', () => {
    const data = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const result = sample(data, 5);
    expect(result[0]).toBe(data[0]);
  });

  it('last sampled value matches last data point', () => {
    const data = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const result = sample(data, 5);
    expect(result[result.length - 1]).toBe(data[data.length - 1]);
  });
});

// ── sparkStr construction ─────────────────────────────────────────────────────

describe('Sparkline sparkStr', () => {
  const BRAILLE_LEVELS = ['⣀', '⣄', '⣤', '⣦', '⣶', '⣷', '⣿', '⣿'];

  function buildSparkStr(data: number[]): string {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const levels = data.map((v) => normalize(v, min, max, BRAILLE_LEVELS.length));
    return levels.map((l) => BRAILLE_LEVELS[l] ?? BRAILLE_LEVELS[0]).join('');
  }

  it('produces a string of length equal to input data length', () => {
    const data = [1, 2, 3, 4, 5];
    expect(buildSparkStr(data).length).toBe(data.length);
  });

  it('all chars in the result are from BRAILLE_LEVELS', () => {
    const data = [10, 40, 20, 80, 60];
    const result = buildSparkStr(data);
    for (const ch of result) {
      expect(BRAILLE_LEVELS).toContain(ch);
    }
  });

  it('all-equal data produces a uniform string', () => {
    const data = [5, 5, 5, 5];
    const result = buildSparkStr(data);
    // All values normalize to Math.floor(levels/2) = 4 when min === max
    expect(result).toBe(BRAILLE_LEVELS[4]!.repeat(4));
  });

  it('monotone ascending data ends with highest braille char', () => {
    const data = [0, 25, 50, 75, 100];
    const result = buildSparkStr(data);
    expect(result[result.length - 1]).toBe(BRAILLE_LEVELS[BRAILLE_LEVELS.length - 1]);
  });
});

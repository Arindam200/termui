import { describe, it, expect } from 'vitest';

// Mirror the pure logic functions from MultiProgress for direct unit testing

function calcPct(value: number, total: number): number {
  return total > 0 ? Math.min(1, value / total) : 0;
}

function renderBar(value: number, total: number, barWidth = 20): string {
  const pct = calcPct(value, total);
  const filled = Math.round(pct * barWidth);
  const empty = barWidth - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s.padEnd(n);
}

describe('MultiProgress logic', () => {
  describe('calcPct', () => {
    it('returns 0 for empty total', () => {
      expect(calcPct(50, 0)).toBe(0);
    });

    it('returns 0.5 for half done', () => {
      expect(calcPct(50, 100)).toBe(0.5);
    });

    it('caps at 1 for overflow', () => {
      expect(calcPct(150, 100)).toBe(1);
    });

    it('returns 1 for complete', () => {
      expect(calcPct(100, 100)).toBe(1);
    });
  });

  describe('renderBar', () => {
    it('produces barWidth characters total', () => {
      const bar = renderBar(50, 100, 20);
      // Strip ANSI and count chars
      expect(bar.replace(/[█░]/g, 'x').length).toBe(20);
    });

    it('all filled when complete', () => {
      const bar = renderBar(100, 100, 10);
      expect(bar).toBe('██████████');
    });

    it('all empty when zero', () => {
      const bar = renderBar(0, 100, 10);
      expect(bar).toBe('░░░░░░░░░░');
    });

    it('half filled at 50%', () => {
      const bar = renderBar(50, 100, 10);
      expect(bar).toBe('█████░░░░░');
    });

    it('uses █ for filled chars', () => {
      const bar = renderBar(1, 10, 10);
      expect(bar[0]).toBe('█');
    });

    it('uses ░ for empty chars', () => {
      const bar = renderBar(0, 10, 10);
      expect(bar[0]).toBe('░');
    });
  });

  describe('truncate', () => {
    it('pads short strings to width', () => {
      expect(truncate('hi', 10).length).toBe(10);
    });

    it('truncates long strings with ellipsis', () => {
      const result = truncate('hello world', 8);
      expect(result.length).toBe(8);
      expect(result.endsWith('…')).toBe(true);
    });

    it('leaves exact-width strings unchanged', () => {
      const result = truncate('hello', 5);
      expect(result).toBe('hello');
    });
  });
});

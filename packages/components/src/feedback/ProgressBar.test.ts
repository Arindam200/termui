import { describe, it, expect } from 'vitest';

function calcPercent(value: number, total?: number): number {
  if (total !== undefined) return Math.min(100, Math.round((value / total) * 100));
  return Math.min(100, Math.round(value));
}

describe('ProgressBar calculations', () => {
  it('calculates percent from value/total', () => {
    expect(calcPercent(50, 200)).toBe(25);
    expect(calcPercent(100, 100)).toBe(100);
    expect(calcPercent(0, 100)).toBe(0);
  });

  it('caps at 100 when overflow', () => {
    expect(calcPercent(150, 100)).toBe(100);
  });

  it('uses direct value when no total', () => {
    expect(calcPercent(75)).toBe(75);
  });
});

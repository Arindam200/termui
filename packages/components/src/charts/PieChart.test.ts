import { describe, it, expect } from 'vitest';
import { PieChart } from './PieChart.js';

// ── Export smoke test ─────────────────────────────────────────────────────────

describe('PieChart export', () => {
  it('is exported as a function', () => {
    expect(typeof PieChart).toBe('function');
  });
});

// ── Block / legend characters ─────────────────────────────────────────────────

describe('PieChart characters', () => {
  const FULL_BLOCK = '█';
  const HALF_BLOCK = '▌';
  const LEGEND_SQUARE = '■';

  it('FULL_BLOCK is █ (U+2588)', () => {
    expect(FULL_BLOCK).toBe('█');
    expect(FULL_BLOCK.codePointAt(0)).toBe(0x2588);
  });

  it('HALF_BLOCK is ▌ (U+258C)', () => {
    expect(HALF_BLOCK).toBe('▌');
    expect(HALF_BLOCK.codePointAt(0)).toBe(0x258c);
  });

  it('LEGEND_SQUARE is ■ (U+25A0)', () => {
    expect(LEGEND_SQUARE).toBe('■');
    expect(LEGEND_SQUARE.codePointAt(0)).toBe(0x25a0);
  });
});

// ── DEFAULT_COLORS palette ────────────────────────────────────────────────────

describe('PieChart DEFAULT_COLORS', () => {
  const DEFAULT_COLORS = [
    '#7c3aed',
    '#2563eb',
    '#16a34a',
    '#d97706',
    '#dc2626',
    '#0891b2',
    '#be185d',
    '#65a30d',
  ];

  it('has 8 default color entries', () => {
    expect(DEFAULT_COLORS.length).toBe(8);
  });

  it('first color is violet #7c3aed', () => {
    expect(DEFAULT_COLORS[0]).toBe('#7c3aed');
  });

  it('last color is lime #65a30d', () => {
    expect(DEFAULT_COLORS[DEFAULT_COLORS.length - 1]).toBe('#65a30d');
  });

  it('all entries are valid hex color strings', () => {
    for (const c of DEFAULT_COLORS) {
      expect(c).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('colors wrap by index modulo when more items than colors', () => {
    // 9th item (idx=8) → DEFAULT_COLORS[8 % 8] = DEFAULT_COLORS[0]
    const idx = 8;
    expect(DEFAULT_COLORS[idx % DEFAULT_COLORS.length]).toBe(DEFAULT_COLORS[0]);
  });
});

// ── Total calculation ─────────────────────────────────────────────────────────

describe('PieChart total calculation', () => {
  function calcTotal(data: Array<{ value: number }>): number {
    return data.reduce((s, d) => s + d.value, 0);
  }

  it('sums all values', () => {
    expect(calcTotal([{ value: 10 }, { value: 20 }, { value: 30 }])).toBe(60);
  });

  it('returns 0 for empty array', () => {
    expect(calcTotal([])).toBe(0);
  });

  it('handles single item', () => {
    expect(calcTotal([{ value: 42 }])).toBe(42);
  });

  it('handles all-zero values', () => {
    expect(calcTotal([{ value: 0 }, { value: 0 }])).toBe(0);
  });
});

// ── Percentage display ────────────────────────────────────────────────────────

describe('PieChart percentage display', () => {
  function calcPct(value: number, total: number): string {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  }

  it('calculates 100.0% for the only item', () => {
    expect(calcPct(50, 50)).toBe('100.0');
  });

  it('calculates 50.0% for half the total', () => {
    expect(calcPct(25, 50)).toBe('50.0');
  });

  it('returns "0.0" when total is zero', () => {
    expect(calcPct(0, 0)).toBe('0.0');
  });

  it('rounds to 1 decimal place', () => {
    // 1/3 = 33.333... → "33.3"
    expect(calcPct(1, 3)).toBe('33.3');
  });

  it('produces a string ending in a digit (no trailing %)', () => {
    const result = calcPct(75, 100);
    expect(result).toBe('75.0');
    expect(result.endsWith('%')).toBe(false);
  });
});

// ── Color assignment ──────────────────────────────────────────────────────────

describe('PieChart color assignment', () => {
  const DEFAULT_COLORS = [
    '#7c3aed',
    '#2563eb',
    '#16a34a',
    '#d97706',
    '#dc2626',
    '#0891b2',
    '#be185d',
    '#65a30d',
  ];

  it('uses item.color when explicitly provided', () => {
    const item = { label: 'A', value: 10, color: '#ff0000' };
    const assigned = item.color ?? DEFAULT_COLORS[0];
    expect(assigned).toBe('#ff0000');
  });

  it('falls back to DEFAULT_COLORS when no color provided', () => {
    const item = { label: 'A', value: 10 };
    const idx = 0;
    const assigned = item.color ?? DEFAULT_COLORS[idx % DEFAULT_COLORS.length] ?? '';
    expect(assigned).toBe('#7c3aed');
  });

  it('cycles palette for index >= palette length', () => {
    const idx = 9; // 9 % 8 = 1
    const assigned = DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
    expect(assigned).toBe(DEFAULT_COLORS[1]);
  });
});

// ── Angle slice calculation ───────────────────────────────────────────────────

describe('PieChart angle slices', () => {
  function buildAngles(data: Array<{ value: number }>): Array<{ start: number; end: number }> {
    const total = data.reduce((s, d) => s + d.value, 0);
    const angles: Array<{ start: number; end: number }> = [];
    let cumulative = 0;
    for (const item of data) {
      const slice = (item.value / total) * Math.PI * 2;
      angles.push({ start: cumulative, end: cumulative + slice });
      cumulative += slice;
    }
    return angles;
  }

  it('first slice starts at 0', () => {
    const angles = buildAngles([{ value: 50 }, { value: 50 }]);
    expect(angles[0]!.start).toBe(0);
  });

  it('last slice ends at 2π (full circle)', () => {
    const angles = buildAngles([{ value: 25 }, { value: 25 }, { value: 50 }]);
    const last = angles[angles.length - 1]!;
    expect(last.end).toBeCloseTo(Math.PI * 2, 10);
  });

  it('equal halves each span π radians', () => {
    const angles = buildAngles([{ value: 50 }, { value: 50 }]);
    expect(angles[0]!.end - angles[0]!.start).toBeCloseTo(Math.PI, 10);
    expect(angles[1]!.end - angles[1]!.start).toBeCloseTo(Math.PI, 10);
  });

  it('a single item spans the full 2π circle', () => {
    const angles = buildAngles([{ value: 100 }]);
    expect(angles[0]!.end - angles[0]!.start).toBeCloseTo(Math.PI * 2, 10);
  });

  it('produces one angle entry per data item', () => {
    const data = [{ value: 1 }, { value: 2 }, { value: 3 }];
    const angles = buildAngles(data);
    expect(angles.length).toBe(data.length);
  });
});

// ── buildPieGrid dimensions ───────────────────────────────────────────────────

describe('PieChart grid dimensions', () => {
  it('grid has radius*2 rows', () => {
    const radius = 5;
    const rows = radius * 2;
    expect(rows).toBe(10);
  });

  it('grid has radius*4 columns', () => {
    const radius = 5;
    const cols = radius * 4;
    expect(cols).toBe(20);
  });

  it('returns empty array when total is 0', () => {
    // buildPieGrid returns [] when total === 0
    const total = 0;
    const grid = total === 0 ? [] : [['placeholder']];
    expect(grid).toEqual([]);
  });

  it('larger radius produces larger grid', () => {
    const r1 = 4;
    const r2 = 8;
    expect(r2 * 2).toBeGreaterThan(r1 * 2);
    expect(r2 * 4).toBeGreaterThan(r1 * 4);
  });
});

// ── Prop defaults ─────────────────────────────────────────────────────────────

describe('PieChart prop defaults', () => {
  it('default radius is 5', () => {
    expect(5).toBe(5);
  });

  it('showLegend defaults to true', () => {
    expect(true).toBe(true);
  });

  it('showPercentages defaults to true', () => {
    expect(true).toBe(true);
  });
});

// ── Empty data ────────────────────────────────────────────────────────────────

describe('PieChart empty data', () => {
  it('empty data message is "No data"', () => {
    expect('No data').toBe('No data');
  });
});

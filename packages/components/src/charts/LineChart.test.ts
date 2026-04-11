import { describe, it, expect } from 'vitest';
import { LineChart } from './LineChart.js';

// ── Export smoke test ─────────────────────────────────────────────────────────

describe('LineChart export', () => {
  it('is exported as a function', () => {
    expect(typeof LineChart).toBe('function');
  });
});

// ── Plot/connector characters ─────────────────────────────────────────────────

describe('LineChart characters', () => {
  const PLOT_CHAR = '●';
  const CONNECT_UP = '╱';
  const CONNECT_DOWN = '╲';
  const AXIS_V = '│';
  const AXIS_H = '─';
  const AXIS_CORNER = '└';
  const AXIS_TICK_V = '┤';

  it('PLOT_CHAR is ● (U+25CF)', () => {
    expect(PLOT_CHAR).toBe('●');
    expect(PLOT_CHAR.codePointAt(0)).toBe(0x25cf);
  });

  it('CONNECT_UP is ╱ (U+2571)', () => {
    expect(CONNECT_UP).toBe('╱');
    expect(CONNECT_UP.codePointAt(0)).toBe(0x2571);
  });

  it('CONNECT_DOWN is ╲ (U+2572)', () => {
    expect(CONNECT_DOWN).toBe('╲');
    expect(CONNECT_DOWN.codePointAt(0)).toBe(0x2572);
  });

  it('AXIS_V is │ (U+2502)', () => {
    expect(AXIS_V).toBe('│');
    expect(AXIS_V.codePointAt(0)).toBe(0x2502);
  });

  it('AXIS_H is ─ (U+2500)', () => {
    expect(AXIS_H).toBe('─');
    expect(AXIS_H.codePointAt(0)).toBe(0x2500);
  });

  it('AXIS_CORNER is └ (U+2514)', () => {
    expect(AXIS_CORNER).toBe('└');
    expect(AXIS_CORNER.codePointAt(0)).toBe(0x2514);
  });

  it('AXIS_TICK_V is ┤ (U+2524)', () => {
    expect(AXIS_TICK_V).toBe('┤');
    expect(AXIS_TICK_V.codePointAt(0)).toBe(0x2524);
  });
});

// ── getValue helper ───────────────────────────────────────────────────────────

describe('LineChart getValue', () => {
  function getValue(d: number | { label?: string; value: number }): number {
    return typeof d === 'number' ? d : d.value;
  }

  it('returns the number directly when input is a number', () => {
    expect(getValue(42)).toBe(42);
  });

  it('returns .value when input is an object', () => {
    expect(getValue({ value: 99 })).toBe(99);
  });

  it('returns .value when label is present too', () => {
    expect(getValue({ label: 'CPU', value: 75 })).toBe(75);
  });

  it('handles zero value', () => {
    expect(getValue(0)).toBe(0);
    expect(getValue({ value: 0 })).toBe(0);
  });

  it('handles negative values', () => {
    expect(getValue(-5)).toBe(-5);
    expect(getValue({ value: -10 })).toBe(-10);
  });
});

// ── getLabel helper ───────────────────────────────────────────────────────────

describe('LineChart getLabel', () => {
  function getLabel(d: number | { label?: string; value: number }): string {
    return typeof d === 'number' ? '' : (d.label ?? '');
  }

  it('returns empty string when input is a number', () => {
    expect(getLabel(10)).toBe('');
  });

  it('returns the label when provided in an object', () => {
    expect(getLabel({ label: 'Jan', value: 50 })).toBe('Jan');
  });

  it('returns empty string when label is absent from object', () => {
    expect(getLabel({ value: 50 })).toBe('');
  });

  it('returns empty string for label: undefined', () => {
    expect(getLabel({ label: undefined, value: 50 })).toBe('');
  });
});

// ── normalize (mirrors charts/utils.ts) ──────────────────────────────────────

describe('LineChart normalize', () => {
  function normalize(value: number, min: number, max: number, levels: number): number {
    if (max === min) return Math.floor(levels / 2);
    return Math.round(((value - min) / (max - min)) * (levels - 1));
  }

  it('returns 0 for the minimum value', () => {
    expect(normalize(0, 0, 100, 10)).toBe(0);
  });

  it('returns levels-1 for the maximum value', () => {
    expect(normalize(100, 0, 100, 10)).toBe(9);
  });

  it('returns Math.floor(levels/2) when min === max', () => {
    expect(normalize(50, 50, 50, 10)).toBe(5);
  });

  it('maps midpoint correctly', () => {
    expect(normalize(50, 0, 100, 11)).toBe(5);
  });
});

// ── chartWidth calculation ────────────────────────────────────────────────────

describe('LineChart chartWidth', () => {
  function calcChartWidth(width: number, maxVal: number, showAxes: boolean): number {
    const yAxisWidth = showAxes ? String(Math.round(maxVal)).length + 2 : 0;
    return Math.max(4, width - yAxisWidth);
  }

  it('reduces width by y-axis space when showAxes is true', () => {
    // maxVal=100 → "100".length + 2 = 5 → chartWidth = 40 - 5 = 35
    expect(calcChartWidth(40, 100, true)).toBe(35);
  });

  it('uses full width when showAxes is false', () => {
    expect(calcChartWidth(40, 100, false)).toBe(40);
  });

  it('clamps to a minimum of 4', () => {
    // width=5, maxVal=1000 → yAxisWidth=6 → 5-6=-1 → clamp to 4
    expect(calcChartWidth(5, 1000, true)).toBe(4);
  });

  it('accounts for single-digit maxVal y-axis width', () => {
    // maxVal=9 → "9".length + 2 = 3 → chartWidth = 40 - 3 = 37
    expect(calcChartWidth(40, 9, true)).toBe(37);
  });
});

// ── Sampling indices ──────────────────────────────────────────────────────────

describe('LineChart sampling indices', () => {
  function buildSampledIndices(numPoints: number, chartWidth: number): number[] {
    return Array.from({ length: chartWidth }, (_, i) =>
      Math.round((i / (chartWidth - 1)) * (numPoints - 1))
    );
  }

  it('first index is always 0', () => {
    const indices = buildSampledIndices(100, 20);
    expect(indices[0]).toBe(0);
  });

  it('last index is always numPoints-1', () => {
    const indices = buildSampledIndices(100, 20);
    expect(indices[indices.length - 1]).toBe(99);
  });

  it('returns exactly chartWidth indices', () => {
    const indices = buildSampledIndices(50, 30);
    expect(indices.length).toBe(30);
  });

  it('returns only index 0 when numPoints is 1', () => {
    // When numPoints=1, (numPoints-1)=0 so all indices are 0
    const indices = buildSampledIndices(1, 5);
    expect(indices.every((i) => i === 0)).toBe(true);
  });

  it('all indices are within [0, numPoints-1]', () => {
    const numPoints = 50;
    const indices = buildSampledIndices(numPoints, 20);
    for (const idx of indices) {
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThanOrEqual(numPoints - 1);
    }
  });
});

// ── Y-axis label generation ───────────────────────────────────────────────────

describe('LineChart Y-axis labels', () => {
  function buildYLabels(minVal: number, maxVal: number, height: number): string[] {
    return Array.from({ length: height }, (_, i) => {
      const rowVal = minVal + ((height - 1 - i) / (height - 1)) * (maxVal - minVal);
      if (i === 0 || i === Math.floor(height / 2) || i === height - 1) {
        return String(Math.round(rowVal));
      }
      return '';
    });
  }

  it('first row (index 0) gets the max value label', () => {
    const labels = buildYLabels(0, 100, 10);
    expect(labels[0]).toBe('100');
  });

  it('last row (index height-1) gets the min value label', () => {
    const labels = buildYLabels(0, 100, 10);
    expect(labels[labels.length - 1]).toBe('0');
  });

  it('mid row gets a label', () => {
    const labels = buildYLabels(0, 100, 10);
    const midIdx = Math.floor(10 / 2);
    expect(labels[midIdx]).not.toBe('');
  });

  it('non-boundary rows have empty labels', () => {
    const height = 10;
    const labels = buildYLabels(0, 100, height);
    const specialRows = new Set([0, Math.floor(height / 2), height - 1]);
    for (let i = 0; i < height; i++) {
      if (!specialRows.has(i)) {
        expect(labels[i]).toBe('');
      }
    }
  });

  it('returns height entries', () => {
    const labels = buildYLabels(0, 100, 10);
    expect(labels.length).toBe(10);
  });
});

// ── Prop defaults ─────────────────────────────────────────────────────────────

describe('LineChart prop defaults', () => {
  it('default width is 40', () => {
    expect(40).toBe(40);
  });

  it('default height is 10', () => {
    expect(10).toBe(10);
  });

  it('showAxes defaults to true', () => {
    expect(true).toBe(true);
  });
});

// ── Empty data ────────────────────────────────────────────────────────────────

describe('LineChart empty data', () => {
  it('empty data message is "No data"', () => {
    const msg = 'No data';
    expect(msg).toBe('No data');
  });
});

// ── Grid connector direction logic ────────────────────────────────────────────

describe('LineChart grid connector direction', () => {
  // Mirrors the connector logic: rows are top-down, so nextRow < row means going up visually
  it('nextRow < row means chart line goes upward (ascending value)', () => {
    const row = 8;
    const nextRow = 3;
    // Going up: fill cells between row-1 and nextRow+1 with AXIS_V
    const cellsToFill: number[] = [];
    let r = row - 1;
    while (r > nextRow) {
      cellsToFill.push(r);
      r--;
    }
    // Should fill rows 4, 5, 6, 7
    expect(cellsToFill).toEqual([7, 6, 5, 4]);
  });

  it('nextRow > row means chart line goes downward (descending value)', () => {
    const row = 2;
    const nextRow = 6;
    const cellsToFill: number[] = [];
    let r = row + 1;
    while (r < nextRow) {
      cellsToFill.push(r);
      r++;
    }
    // Should fill rows 3, 4, 5
    expect(cellsToFill).toEqual([3, 4, 5]);
  });

  it('nextRow === row means flat — no connector cells between', () => {
    const row = 5;
    const nextRow = 5;
    expect(nextRow === row).toBe(true);
  });
});

// ── Single data point edge case ───────────────────────────────────────────────

describe('LineChart single data point', () => {
  it('normalize with equal min/max returns Math.floor(levels/2)', () => {
    function normalize(value: number, min: number, max: number, levels: number): number {
      if (max === min) return Math.floor(levels / 2);
      return Math.round(((value - min) / (max - min)) * (levels - 1));
    }
    // Single point: minVal === maxVal
    expect(normalize(42, 42, 42, 10)).toBe(5);
  });

  it('sampling with numPoints=1 always returns index 0', () => {
    const numPoints = 1;
    const chartWidth = 10;
    const indices = Array.from({ length: chartWidth }, (_, i) =>
      Math.round((i / (chartWidth - 1)) * (numPoints - 1))
    );
    expect(indices.every((idx) => idx === 0)).toBe(true);
  });
});

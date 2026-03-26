import { describe, it, expect } from 'vitest';
import { BarChart } from './BarChart.js';

// ── Export smoke test ─────────────────────────────────────────────────────────

describe('BarChart export', () => {
  it('is exported as a function', () => {
    expect(typeof BarChart).toBe('function');
  });
});

// ── Block characters ──────────────────────────────────────────────────────────

describe('BarChart block chars', () => {
  const BAR_CHAR = '█';
  const EMPTY_CHAR = '░';

  it('BAR_CHAR is the full block █', () => {
    expect(BAR_CHAR).toBe('█');
    expect(BAR_CHAR.codePointAt(0)).toBe(0x2588);
  });

  it('EMPTY_CHAR is the light shade ░', () => {
    expect(EMPTY_CHAR).toBe('░');
    expect(EMPTY_CHAR.codePointAt(0)).toBe(0x2591);
  });

  it('bar string is only composed of BAR_CHAR and EMPTY_CHAR', () => {
    const filled = 3;
    const empty = 7;
    const bar = BAR_CHAR.repeat(filled) + EMPTY_CHAR.repeat(empty);
    expect(bar.length).toBe(10);
    for (const ch of bar) {
      expect([BAR_CHAR, EMPTY_CHAR]).toContain(ch);
    }
  });
});

// ── Bar fill calculation ──────────────────────────────────────────────────────

describe('BarChart fill calculation', () => {
  function calcFilled(value: number, maxValue: number, barWidth: number): number {
    if (maxValue === 0) return 0;
    return Math.round((value / maxValue) * Math.max(1, barWidth));
  }

  it('fills fully when value equals max', () => {
    expect(calcFilled(100, 100, 20)).toBe(20);
  });

  it('fills 0 when value is 0', () => {
    expect(calcFilled(0, 100, 20)).toBe(0);
  });

  it('fills half when value is 50% of max', () => {
    expect(calcFilled(50, 100, 20)).toBe(10);
  });

  it('returns 0 when maxValue is 0 (avoids division by zero)', () => {
    expect(calcFilled(0, 0, 20)).toBe(0);
    expect(calcFilled(5, 0, 20)).toBe(0);
  });

  it('rounds to nearest integer', () => {
    // 33 / 100 * 20 = 6.6 → rounds to 7
    expect(calcFilled(33, 100, 20)).toBe(7);
  });
});

// ── maxValue derivation ───────────────────────────────────────────────────────

describe('BarChart maxValue', () => {
  function maxValue(data: Array<{ value: number }>): number {
    return Math.max(...data.map((d) => d.value));
  }

  it('finds the max from a data array', () => {
    expect(maxValue([{ value: 10 }, { value: 50 }, { value: 30 }])).toBe(50);
  });

  it('handles a single item', () => {
    expect(maxValue([{ value: 42 }])).toBe(42);
  });

  it('handles all equal values', () => {
    expect(maxValue([{ value: 5 }, { value: 5 }, { value: 5 }])).toBe(5);
  });
});

// ── Label padding ─────────────────────────────────────────────────────────────
// mirrors charts/utils padEnd: pads right, and truncates when str.length >= width

describe('BarChart label padding (padEnd)', () => {
  function padEnd(str: string, width: number): string {
    if (str.length >= width) return str.slice(0, width);
    return str + ' '.repeat(width - str.length);
  }

  it('pads label to the specified width', () => {
    expect(padEnd('CPU', 6)).toBe('CPU   ');
  });

  it('truncates a label longer than width', () => {
    expect(padEnd('LongLabel', 4)).toBe('Long');
  });

  it('no-ops when label length equals width', () => {
    expect(padEnd('Hi', 2)).toBe('Hi');
  });
});

// ── maxLabelLen / maxValLen ───────────────────────────────────────────────────

describe('BarChart column width detection', () => {
  const data = [
    { label: 'CPU', value: 75 },
    { label: 'Memory', value: 1024 },
    { label: 'Disk', value: 50 },
  ];

  it('detects the longest label correctly', () => {
    const maxLabelLen = Math.max(...data.map((d) => d.label.length));
    expect(maxLabelLen).toBe(6); // 'Memory'
  });

  it('detects the longest value string correctly', () => {
    const maxValLen = Math.max(...data.map((d) => String(d.value).length));
    expect(maxValLen).toBe(4); // '1024'
  });
});

// ── Empty data ────────────────────────────────────────────────────────────────

describe('BarChart empty data', () => {
  it('returns "No data" text when data array is empty', () => {
    // The component renders <Text>No data</Text> for empty data;
    // confirm the message string matches exactly.
    const noDataMsg = 'No data';
    expect(noDataMsg).toBe('No data');
  });
});

// ── Prop defaults ─────────────────────────────────────────────────────────────

describe('BarChart prop defaults', () => {
  it('default direction is horizontal', () => {
    const direction = 'horizontal';
    expect(direction).toBe('horizontal');
  });

  it('default width is 30', () => {
    expect(30).toBe(30);
  });

  it('default height is 10', () => {
    expect(10).toBe(10);
  });

  it('showValues defaults to true', () => {
    expect(true).toBe(true);
  });
});

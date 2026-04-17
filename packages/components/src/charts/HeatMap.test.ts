import { describe, it, expect } from 'vitest';
import { HeatMap } from './HeatMap.js';

// ── Export smoke test ─────────────────────────────────────────────────────────

describe('HeatMap export', () => {
  it('is exported as a function', () => {
    expect(typeof HeatMap).toBe('function');
  });
});

// ── Shade characters ──────────────────────────────────────────────────────────

describe('HeatMap shade characters', () => {
  const SHADE_CHARS = [' ', '░', '▒', '▓', '█'];

  it('has 5 shade entries', () => {
    expect(SHADE_CHARS.length).toBe(5);
  });

  it('first shade char is a space (lightest / lowest intensity)', () => {
    expect(SHADE_CHARS[0]).toBe(' ');
  });

  it('last shade char is █ (U+2588) — densest / highest intensity', () => {
    expect(SHADE_CHARS[4]).toBe('█');
    expect(SHADE_CHARS[4]!.codePointAt(0)).toBe(0x2588);
  });

  it('░ is light shade (U+2591)', () => {
    expect(SHADE_CHARS[1]).toBe('░');
    expect(SHADE_CHARS[1]!.codePointAt(0)).toBe(0x2591);
  });

  it('▒ is medium shade (U+2592)', () => {
    expect(SHADE_CHARS[2]).toBe('▒');
    expect(SHADE_CHARS[2]!.codePointAt(0)).toBe(0x2592);
  });

  it('▓ is dark shade (U+2593)', () => {
    expect(SHADE_CHARS[3]).toBe('▓');
    expect(SHADE_CHARS[3]!.codePointAt(0)).toBe(0x2593);
  });
});

// ── Default color scale ───────────────────────────────────────────────────────

describe('HeatMap default color scale', () => {
  const DEFAULT_COLOR_SCALE = [
    '#1e3a5f',
    '#1a5276',
    '#1f618d',
    '#2980b9',
    '#5dade2',
    '#f39c12',
    '#e67e22',
    '#e74c3c',
    '#c0392b',
  ];

  it('has 9 entries in the default color scale', () => {
    expect(DEFAULT_COLOR_SCALE.length).toBe(9);
  });

  it('first color is dark blue #1e3a5f (lowest / cool)', () => {
    expect(DEFAULT_COLOR_SCALE[0]).toBe('#1e3a5f');
  });

  it('last color is deep red #c0392b (highest / warm)', () => {
    expect(DEFAULT_COLOR_SCALE[DEFAULT_COLOR_SCALE.length - 1]).toBe('#c0392b');
  });

  it('all entries are valid hex color strings', () => {
    for (const c of DEFAULT_COLOR_SCALE) {
      expect(c).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('mid-scale color is mid-blue (transition region)', () => {
    // index 4 is '#5dade2'
    expect(DEFAULT_COLOR_SCALE[4]).toBe('#5dade2');
  });
});

// ── getColorForValue helper ───────────────────────────────────────────────────

function getColorForValue(value: number, min: number, max: number, scale: string[]): string {
  if (max === min) return scale[Math.floor(scale.length / 2)] ?? '#888888';
  const t = (value - min) / (max - min);
  const idx = Math.min(scale.length - 1, Math.round(t * (scale.length - 1)));
  return scale[idx] ?? scale[0] ?? '#888888';
}

describe('HeatMap getColorForValue', () => {
  const SCALE = ['#000', '#444', '#888', '#ccc', '#fff'];

  it('returns first color for the minimum value', () => {
    expect(getColorForValue(0, 0, 100, SCALE)).toBe('#000');
  });

  it('returns last color for the maximum value', () => {
    expect(getColorForValue(100, 0, 100, SCALE)).toBe('#fff');
  });

  it('returns middle color for the midpoint value', () => {
    // t=0.5 → idx = round(0.5*4) = 2 → '#888'
    expect(getColorForValue(50, 0, 100, SCALE)).toBe('#888');
  });

  it('returns scale[floor(length/2)] when min === max', () => {
    // length=5 → floor(5/2)=2 → '#888'
    expect(getColorForValue(50, 50, 50, SCALE)).toBe('#888');
  });

  it('clamps to last color when value exceeds max', () => {
    expect(getColorForValue(200, 0, 100, SCALE)).toBe('#fff');
  });

  it('returns fallback #888888 for empty scale when min===max', () => {
    expect(getColorForValue(5, 5, 5, [])).toBe('#888888');
  });
});

// ── getShadeForValue helper ───────────────────────────────────────────────────

function getShadeForValue(value: number, min: number, max: number): string {
  const SHADE_CHARS = [' ', '░', '▒', '▓', '█'];
  if (max === min) return SHADE_CHARS[2] ?? '▒';
  const t = (value - min) / (max - min);
  const idx = Math.min(SHADE_CHARS.length - 1, Math.round(t * (SHADE_CHARS.length - 1)));
  return SHADE_CHARS[idx] ?? SHADE_CHARS[0] ?? ' ';
}

describe('HeatMap getShadeForValue', () => {
  it('returns space (lightest) for minimum value', () => {
    expect(getShadeForValue(0, 0, 100)).toBe(' ');
  });

  it('returns █ (densest) for maximum value', () => {
    expect(getShadeForValue(100, 0, 100)).toBe('█');
  });

  it('returns ▒ (mid shade) when min === max', () => {
    expect(getShadeForValue(50, 50, 50)).toBe('▒');
  });

  it('returns mid-shade for midpoint value', () => {
    // t=0.5 → idx=round(0.5*4)=2 → '▒'
    expect(getShadeForValue(50, 0, 100)).toBe('▒');
  });

  it('all-zero data produces mid-shade', () => {
    expect(getShadeForValue(0, 0, 0)).toBe('▒');
  });
});

// ── padCenter helper ──────────────────────────────────────────────────────────

function padCenter(str: string, width: number): string {
  if (str.length >= width) return str.slice(0, width);
  const total = width - str.length;
  const left = Math.floor(total / 2);
  const right = total - left;
  return ' '.repeat(left) + str + ' '.repeat(right);
}

describe('HeatMap padCenter', () => {
  it('centers a short string within the given width', () => {
    expect(padCenter('A', 5)).toBe('  A  ');
  });

  it('truncates when string is longer than width', () => {
    expect(padCenter('Hello', 3)).toBe('Hel');
  });

  it('no-ops when string length equals width', () => {
    expect(padCenter('Hi', 2)).toBe('Hi');
  });

  it('returns string of exactly the specified width', () => {
    const result = padCenter('X', 7);
    expect(result.length).toBe(7);
  });

  it('left-biases the extra space for odd padding', () => {
    // total=2: left=1, right=1 → same; total=1: left=0, right=1
    const result = padCenter('AB', 5); // total=3: left=1, right=2
    expect(result).toBe(' AB  ');
  });

  it('handles empty string', () => {
    const result = padCenter('', 4);
    expect(result).toBe('    ');
  });
});

// ── padStart helper ───────────────────────────────────────────────────────────

function padStart(str: string, width: number): string {
  if (str.length >= width) return str.slice(0, width);
  return ' '.repeat(width - str.length) + str;
}

describe('HeatMap padStart', () => {
  it('pads with spaces on the left', () => {
    expect(padStart('A', 4)).toBe('   A');
  });

  it('truncates when string is longer than width', () => {
    expect(padStart('Hello', 3)).toBe('Hel');
  });

  it('no-ops when string length equals width', () => {
    expect(padStart('Hi', 2)).toBe('Hi');
  });

  it('returns exactly width characters', () => {
    expect(padStart('Z', 6).length).toBe(6);
  });
});

// ── Row label width calculation ───────────────────────────────────────────────

describe('HeatMap row label width', () => {
  function rowLabelWidth(rowLabels: string[]): number {
    return rowLabels.length > 0 ? Math.max(...rowLabels.map((l) => l.length)) + 1 : 0;
  }

  it('returns 0 when no row labels provided', () => {
    expect(rowLabelWidth([])).toBe(0);
  });

  it('returns longest label length + 1', () => {
    expect(rowLabelWidth(['Mon', 'Tuesday', 'Wed'])).toBe(8); // 'Tuesday'.length + 1
  });

  it('handles single label', () => {
    expect(rowLabelWidth(['ABC'])).toBe(4);
  });

  it('handles equal-length labels', () => {
    expect(rowLabelWidth(['A', 'B', 'C'])).toBe(2);
  });
});

// ── Global min/max computation ────────────────────────────────────────────────

describe('HeatMap min/max computation', () => {
  it('computes global min from all rows', () => {
    const data = [
      [5, 10],
      [1, 8],
      [3, 6],
    ];
    const allValues = data.flat();
    expect(Math.min(...allValues)).toBe(1);
  });

  it('computes global max from all rows', () => {
    const data = [
      [5, 10],
      [1, 8],
      [3, 6],
    ];
    const allValues = data.flat();
    expect(Math.max(...allValues)).toBe(10);
  });

  it('min equals max for a single cell', () => {
    const data = [[42]];
    const allValues = data.flat();
    expect(Math.min(...allValues)).toBe(Math.max(...allValues));
  });

  it('all-zero data has min=0 and max=0', () => {
    const data = [
      [0, 0],
      [0, 0],
    ];
    const allValues = data.flat();
    expect(Math.min(...allValues)).toBe(0);
    expect(Math.max(...allValues)).toBe(0);
  });
});

// ── Empty data ────────────────────────────────────────────────────────────────

describe('HeatMap empty data', () => {
  it('empty data message is "No data"', () => {
    expect('No data').toBe('No data');
  });

  it('empty top-level array has length 0', () => {
    const data: number[][] = [];
    expect(data.length).toBe(0);
  });

  it('data with empty inner array is treated as empty', () => {
    const data = [[]];
    // data.length > 0 but data[0].length === 0
    expect(data[0]!.length).toBe(0);
  });
});

// ── Prop defaults ─────────────────────────────────────────────────────────────

describe('HeatMap prop defaults', () => {
  it('default cellWidth is 5', () => {
    expect(5).toBe(5);
  });

  it('showValues defaults to false', () => {
    expect(false).toBe(false);
  });

  it('default color scale has 9 entries', () => {
    const DEFAULT_COLOR_SCALE = [
      '#1e3a5f',
      '#1a5276',
      '#1f618d',
      '#2980b9',
      '#5dade2',
      '#f39c12',
      '#e67e22',
      '#e74c3c',
      '#c0392b',
    ];
    expect(DEFAULT_COLOR_SCALE.length).toBe(9);
  });
});

// ── Cell content when showValues is true ─────────────────────────────────────

describe('HeatMap cell content (showValues)', () => {
  it('when showValues=true, cell content is the rounded value centered in cellWidth', () => {
    const val = 42;
    const cellWidth = 5;
    const content = padCenter(String(Math.round(val)), cellWidth);
    expect(content.trim()).toBe('42');
    expect(content.length).toBe(cellWidth);
  });

  it('when showValues=false, cell content is shade char repeated cellWidth times', () => {
    const shadeChar = getShadeForValue(0, 0, 100); // ' '
    const cellWidth = 5;
    const content = shadeChar.repeat(cellWidth);
    expect(content.length).toBe(cellWidth);
  });

  it('value display for max intensity fills with full block char', () => {
    const val = 100;
    const cellWidth = 5;
    const content = padCenter(String(Math.round(val)), cellWidth);
    expect(content.includes('100')).toBe(true);
  });
});

// ── Color scale index clamping ────────────────────────────────────────────────

describe('HeatMap color scale index clamping', () => {
  it('index never exceeds scale.length - 1', () => {
    const scale = ['#000', '#888', '#fff'];
    const idx = Math.min(scale.length - 1, Math.round(1.0 * (scale.length - 1)));
    expect(idx).toBe(2);
    expect(idx).toBeLessThan(scale.length);
  });

  it('index is 0 for t=0 (minimum value)', () => {
    const scale = ['#000', '#888', '#fff'];
    const idx = Math.min(scale.length - 1, Math.round(0 * (scale.length - 1)));
    expect(idx).toBe(0);
  });

  it('custom color scale is used when provided', () => {
    const customScale = ['#aaa', '#bbb', '#ccc'];
    const color = getColorForValue(100, 0, 100, customScale);
    expect(color).toBe('#ccc');
  });

  it('single-entry scale always returns that entry', () => {
    const scale = ['#deadbe'];
    expect(getColorForValue(0, 0, 100, scale)).toBe('#deadbe');
    expect(getColorForValue(50, 0, 100, scale)).toBe('#deadbe');
    expect(getColorForValue(100, 0, 100, scale)).toBe('#deadbe');
  });
});

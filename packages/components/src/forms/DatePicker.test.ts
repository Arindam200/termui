import { describe, it, expect } from 'vitest';
import { DatePicker } from './DatePicker.js';

// ── Export smoke test ──────────────────────────────────────────────────────

describe('DatePicker export', () => {
  it('is exported as a function', () => {
    expect(typeof DatePicker).toBe('function');
  });
});

// ── MONTHS array ───────────────────────────────────────────────────────────
// Inline copy from DatePicker.tsx

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

describe('MONTHS', () => {
  it('has 12 entries', () => {
    expect(MONTHS.length).toBe(12);
  });

  it('starts with January at index 0', () => {
    expect(MONTHS[0]).toBe('January');
  });

  it('ends with December at index 11', () => {
    expect(MONTHS[11]).toBe('December');
  });

  it('preview uses 3-char slice correctly', () => {
    expect((MONTHS[0] ?? '').slice(0, 3)).toBe('Jan');
    expect((MONTHS[5] ?? '').slice(0, 3)).toBe('Jun');
    expect((MONTHS[11] ?? '').slice(0, 3)).toBe('Dec');
  });
});

// ── daysInMonth ────────────────────────────────────────────────────────────
// Inline copy of the helper function from DatePicker.tsx

function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

describe('daysInMonth', () => {
  it('returns 31 for January (month 0)', () => {
    expect(daysInMonth(0, 2024)).toBe(31);
  });

  it('returns 28 for February in a non-leap year', () => {
    expect(daysInMonth(1, 2023)).toBe(28);
  });

  it('returns 29 for February in a leap year', () => {
    expect(daysInMonth(1, 2024)).toBe(29);
  });

  it('returns 30 for April (month 3)', () => {
    expect(daysInMonth(3, 2024)).toBe(30);
  });

  it('returns 31 for December (month 11)', () => {
    expect(daysInMonth(11, 2024)).toBe(31);
  });

  it('returns 31 for July (month 6)', () => {
    expect(daysInMonth(6, 2024)).toBe(31);
  });

  it('returns 30 for September (month 8)', () => {
    expect(daysInMonth(8, 2024)).toBe(30);
  });

  it('handles year 2000 (leap year) correctly', () => {
    expect(daysInMonth(1, 2000)).toBe(29);
  });

  it('handles year 1900 (not a leap year) correctly', () => {
    expect(daysInMonth(1, 1900)).toBe(28);
  });
});

// ── clamp ──────────────────────────────────────────────────────────────────
// Inline copy from DatePicker.tsx

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

describe('clamp', () => {
  it('returns the value when within range', () => {
    expect(clamp(5, 1, 10)).toBe(5);
  });

  it('clamps to min when value is below range', () => {
    expect(clamp(0, 1, 10)).toBe(1);
  });

  it('clamps to max when value is above range', () => {
    expect(clamp(15, 1, 10)).toBe(10);
  });

  it('returns min when value equals min', () => {
    expect(clamp(1, 1, 10)).toBe(1);
  });

  it('returns max when value equals max', () => {
    expect(clamp(10, 1, 10)).toBe(10);
  });
});

// ── Day clamping when month changes ───────────────────────────────────────
// Mirrors the logic in DatePicker's upArrow handler.

describe('day clamping on month change', () => {
  it('clamps day 31 when switching to a 30-day month', () => {
    const day = 31;
    const newMonth = 3; // April (30 days)
    const year = 2024;
    const maxDay = daysInMonth(newMonth, year);
    const newDay = clamp(day, 1, maxDay);
    expect(newDay).toBe(30);
  });

  it('clamps day 31 to 28 when switching to Feb in a non-leap year', () => {
    const day = 31;
    const newMonth = 1; // February
    const year = 2023;
    const maxDay = daysInMonth(newMonth, year);
    const newDay = clamp(day, 1, maxDay);
    expect(newDay).toBe(28);
  });

  it('does not clamp day 28 when switching to Feb in a non-leap year', () => {
    const day = 28;
    const newMonth = 1;
    const year = 2023;
    const maxDay = daysInMonth(newMonth, year);
    const newDay = clamp(day, 1, maxDay);
    expect(newDay).toBe(28);
  });
});

// ── Day wrapping logic ─────────────────────────────────────────────────────

describe('day wrapping', () => {
  it('wraps from maxDay back to 1', () => {
    const day = 31;
    const maxDay = daysInMonth(0, 2024); // January = 31
    const newDay = day >= maxDay ? 1 : day + 1;
    expect(newDay).toBe(1);
  });

  it('wraps from 1 back to maxDay', () => {
    const day = 1;
    const maxDay = daysInMonth(0, 2024); // January = 31
    const newDay = day <= 1 ? maxDay : day - 1;
    expect(newDay).toBe(31);
  });

  it('increments normally when not at max', () => {
    const day = 15;
    const maxDay = 31;
    const newDay = day >= maxDay ? 1 : day + 1;
    expect(newDay).toBe(16);
  });
});

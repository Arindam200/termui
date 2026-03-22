import { describe, it, expect } from 'vitest';
import { TimePicker } from './TimePicker.js';

// ── Export smoke test ──────────────────────────────────────────────────────

describe('TimePicker export', () => {
  it('is exported as a function', () => {
    expect(typeof TimePicker).toBe('function');
  });
});

// ── 12-hour conversion (notify function logic) ─────────────────────────────
// Mirrors the notify() function in TimePicker.tsx

function toActualHours(h: number, ampm: 'AM' | 'PM', format: 12 | 24): number {
  if (format === 24) return h;
  if (ampm === 'AM' && h === 12) return 0;
  if (ampm === 'PM' && h !== 12) return h + 12;
  return h;
}

describe('12-hour to 24-hour conversion', () => {
  it('converts 12 AM to 0 (midnight)', () => {
    expect(toActualHours(12, 'AM', 12)).toBe(0);
  });

  it('converts 1 AM to 1', () => {
    expect(toActualHours(1, 'AM', 12)).toBe(1);
  });

  it('converts 11 AM to 11', () => {
    expect(toActualHours(11, 'AM', 12)).toBe(11);
  });

  it('converts 12 PM to 12 (noon)', () => {
    expect(toActualHours(12, 'PM', 12)).toBe(12);
  });

  it('converts 1 PM to 13', () => {
    expect(toActualHours(1, 'PM', 12)).toBe(13);
  });

  it('converts 11 PM to 23', () => {
    expect(toActualHours(11, 'PM', 12)).toBe(23);
  });

  it('passes through unchanged in 24-hour format', () => {
    expect(toActualHours(0, 'AM', 24)).toBe(0);
    expect(toActualHours(13, 'AM', 24)).toBe(13);
    expect(toActualHours(23, 'PM', 24)).toBe(23);
  });
});

// ── Display hours (12h mode) ───────────────────────────────────────────────
// Mirrors the displayHours computation in the render.

function toDisplayHours(hours: number): number {
  if (hours === 0) return 12;
  if (hours > 12) return hours - 12;
  return hours;
}

describe('24-hour to 12-hour display', () => {
  it('shows 12 for midnight (0)', () => {
    expect(toDisplayHours(0)).toBe(12);
  });

  it('shows 12 for noon (12)', () => {
    expect(toDisplayHours(12)).toBe(12);
  });

  it('shows 1 for 13:00', () => {
    expect(toDisplayHours(13)).toBe(1);
  });

  it('shows 11 for 23:00', () => {
    expect(toDisplayHours(23)).toBe(11);
  });

  it('preserves AM hours 1–11 unchanged', () => {
    for (let h = 1; h <= 11; h++) {
      expect(toDisplayHours(h)).toBe(h);
    }
  });
});

// ── Hours bounds ───────────────────────────────────────────────────────────
// Mirrors the hour increment/decrement logic in TimePicker.

function incrementHours(h: number, format: 12 | 24): number {
  const maxH = format === 12 ? 12 : 23;
  const minH = format === 12 ? 1 : 0;
  return h >= maxH ? minH : h + 1;
}

function decrementHours(h: number, format: 12 | 24): number {
  const maxH = format === 12 ? 12 : 23;
  const minH = format === 12 ? 1 : 0;
  return h <= minH ? maxH : h - 1;
}

describe('hour increment/decrement', () => {
  describe('24-hour format', () => {
    it('increments 0 → 1', () => expect(incrementHours(0, 24)).toBe(1));
    it('increments 23 → 0 (wraps)', () => expect(incrementHours(23, 24)).toBe(0));
    it('decrements 1 → 0', () => expect(decrementHours(1, 24)).toBe(0));
    it('decrements 0 → 23 (wraps)', () => expect(decrementHours(0, 24)).toBe(23));
  });

  describe('12-hour format', () => {
    it('increments 11 → 12', () => expect(incrementHours(11, 12)).toBe(12));
    it('increments 12 → 1 (wraps)', () => expect(incrementHours(12, 12)).toBe(1));
    it('decrements 2 → 1', () => expect(decrementHours(2, 12)).toBe(1));
    it('decrements 1 → 12 (wraps)', () => expect(decrementHours(1, 12)).toBe(12));
  });
});

// ── Minutes bounds ─────────────────────────────────────────────────────────

function incrementMinutes(m: number): number {
  return m >= 59 ? 0 : m + 1;
}

function decrementMinutes(m: number): number {
  return m <= 0 ? 59 : m - 1;
}

describe('minute increment/decrement', () => {
  it('increments normally', () => expect(incrementMinutes(30)).toBe(31));
  it('wraps 59 → 0', () => expect(incrementMinutes(59)).toBe(0));
  it('decrements normally', () => expect(decrementMinutes(30)).toBe(29));
  it('wraps 0 → 59', () => expect(decrementMinutes(0)).toBe(59));
});

// ── AM/PM toggle ──────────────────────────────────────────────────────────

function toggleAmPm(ampm: 'AM' | 'PM'): 'AM' | 'PM' {
  return ampm === 'AM' ? 'PM' : 'AM';
}

describe('AM/PM toggle', () => {
  it('toggles AM to PM', () => expect(toggleAmPm('AM')).toBe('PM'));
  it('toggles PM to AM', () => expect(toggleAmPm('PM')).toBe('AM'));
});

// ── String padding for display ─────────────────────────────────────────────

describe('time display padding', () => {
  it('pads single-digit hours to 2 chars', () => {
    expect(String(1).padStart(2, '0')).toBe('01');
  });

  it('does not pad two-digit hours', () => {
    expect(String(12).padStart(2, '0')).toBe('12');
  });

  it('pads single-digit minutes to 2 chars', () => {
    expect(String(5).padStart(2, '0')).toBe('05');
  });
});

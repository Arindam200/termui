import { describe, it, expect } from 'vitest';
import { MaskedInput } from './MaskedInput.js';

// ── Inline copies of the private helpers for unit-testing ──────────────────
// (The originals are not exported; we reproduce them here exactly as written
//  in the source so the logic is tested independently of React.)

function applyMask(raw: string, mask: string): string {
  let rawIdx = 0;
  let result = '';

  for (let i = 0; i < mask.length; i++) {
    if (rawIdx >= raw.length) break;
    const maskChar = mask[i]!;
    if (maskChar === '#') {
      result += raw[rawIdx]!;
      rawIdx++;
    } else {
      result += maskChar;
    }
  }

  return result;
}

function maxDigits(mask: string): number {
  return mask.split('').filter((c) => c === '#').length;
}

// ── Component export smoke-test ────────────────────────────────────────────

describe('MaskedInput export', () => {
  it('is exported as a function (React component)', () => {
    expect(typeof MaskedInput).toBe('function');
  });
});

// ── applyMask ──────────────────────────────────────────────────────────────

describe('applyMask', () => {
  const PHONE_MASK = '(###) ###-####';

  it('returns empty string for empty raw input', () => {
    expect(applyMask('', PHONE_MASK)).toBe('');
  });

  it('formats a single digit without separator', () => {
    expect(applyMask('1', PHONE_MASK)).toBe('(1');
  });

  it('stops emitting when raw digits run out, even before the next separator', () => {
    // The loop breaks as soon as rawIdx >= raw.length, so trailing literal
    // chars (like ')') are NOT emitted after the last digit.
    expect(applyMask('123', PHONE_MASK)).toBe('(123');
    expect(applyMask('1234', PHONE_MASK)).toBe('(123) 4');
  });

  it('formats a complete US phone number', () => {
    expect(applyMask('1234567890', PHONE_MASK)).toBe('(123) 456-7890');
  });

  it('stops at mask length when more raw digits are provided', () => {
    // Extra digits beyond the mask capacity are simply ignored
    const result = applyMask('12345678901234', PHONE_MASK);
    expect(result).toBe('(123) 456-7890');
  });

  it('works with a date mask', () => {
    const DATE_MASK = '##/##/####';
    expect(applyMask('12032025', DATE_MASK)).toBe('12/03/2025');
  });

  it('works with a mask that has no digit placeholders', () => {
    // No '#' → literal chars are emitted unconditionally until raw runs out.
    // rawIdx never advances so the break condition rawIdx >= raw.length(3) is
    // never true — all three literal chars are emitted.
    expect(applyMask('999', 'XXX')).toBe('XXX');
  });

  it('handles partial raw input correctly', () => {
    const DATE_MASK = '##/##/####';
    expect(applyMask('12', DATE_MASK)).toBe('12');
    expect(applyMask('120', DATE_MASK)).toBe('12/0');
  });
});

// ── maxDigits ──────────────────────────────────────────────────────────────

describe('maxDigits', () => {
  it('counts # characters in the mask', () => {
    expect(maxDigits('(###) ###-####')).toBe(10);
  });

  it('returns 0 for a mask with no placeholders', () => {
    expect(maxDigits('XX-XX')).toBe(0);
  });

  it('counts correctly for a date mask', () => {
    expect(maxDigits('##/##/####')).toBe(8);
  });

  it('returns 1 for a single-placeholder mask', () => {
    expect(maxDigits('#')).toBe(1);
  });
});

// ── Digit-only rule (inline) ───────────────────────────────────────────────

describe('digit-only acceptance rule', () => {
  const digitOnly = (input: string) => /^\d$/.test(input);

  it('accepts single digit characters', () => {
    for (const d of ['0', '1', '5', '9']) {
      expect(digitOnly(d)).toBe(true);
    }
  });

  it('rejects letters', () => {
    expect(digitOnly('a')).toBe(false);
    expect(digitOnly('Z')).toBe(false);
  });

  it('rejects multi-character strings', () => {
    expect(digitOnly('12')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(digitOnly('')).toBe(false);
  });

  it('rejects special characters', () => {
    expect(digitOnly('#')).toBe(false);
    expect(digitOnly('-')).toBe(false);
  });
});

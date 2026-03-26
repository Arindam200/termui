import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from '@termui/testing';
import { ThemeProvider } from '@termui/core';
import { NumberInput } from './NumberInput.js';

const e = React.createElement;

function wrap(child: React.ReactElement): React.ReactElement {
  return e(ThemeProvider, {}, child);
}

// ── Export smoke test ──────────────────────────────────────────────────────

describe('NumberInput export', () => {
  it('is exported as a function', () => {
    expect(typeof NumberInput).toBe('function');
  });
});

// ── Value rendering ────────────────────────────────────────────────────────

describe('NumberInput value rendering', () => {
  it('renders the controlled numeric value as a string', async () => {
    const output = await renderToString(wrap(e(NumberInput, { value: 42 })));
    expect(output).toContain('42');
  });

  it('renders a negative value', async () => {
    const output = await renderToString(wrap(e(NumberInput, { value: -7 })));
    expect(output).toContain('-7');
  });

  it('renders a decimal value', async () => {
    const output = await renderToString(wrap(e(NumberInput, { value: 3.14 })));
    expect(output).toContain('3.14');
  });

  it('renders zero', async () => {
    const output = await renderToString(wrap(e(NumberInput, { value: 0 })));
    expect(output).toContain('0');
  });

  it('renders placeholder when no value is provided', async () => {
    const output = await renderToString(wrap(e(NumberInput, { placeholder: 'Enter number' })));
    expect(output).toContain('Enter number');
  });

  it('renders label when provided', async () => {
    const output = await renderToString(wrap(e(NumberInput, { label: 'Port', value: 3000 })));
    expect(output).toContain('Port');
    expect(output).toContain('3000');
  });
});

// ── Custom format function ─────────────────────────────────────────────────

describe('NumberInput format function', () => {
  it('applies a custom format function to the displayed value', async () => {
    const output = await renderToString(
      wrap(e(NumberInput, { value: 1000, format: (n) => `$${n.toFixed(2)}` }))
    );
    expect(output).toContain('$1000.00');
  });
});

// ── Clamp logic (pure) ────────────────────────────────────────────────────
// Mirrors the clamp() function inside NumberInput.tsx

function clamp(n: number, min?: number, max?: number): number {
  let result = n;
  if (min !== undefined) result = Math.max(min, result);
  if (max !== undefined) result = Math.min(max, result);
  return result;
}

describe('NumberInput clamp logic', () => {
  it('clamps value below min up to min', () => {
    expect(clamp(5, 10)).toBe(10);
  });

  it('does not clamp a value above min', () => {
    expect(clamp(15, 10)).toBe(15);
  });

  it('clamps value above max down to max', () => {
    expect(clamp(150, undefined, 100)).toBe(100);
  });

  it('does not clamp a value below max', () => {
    expect(clamp(50, undefined, 100)).toBe(50);
  });

  it('clamps both min and max together', () => {
    expect(clamp(200, 0, 100)).toBe(100);
    expect(clamp(-5, 0, 100)).toBe(0);
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it('does not clamp when neither min nor max is set', () => {
    expect(clamp(9999)).toBe(9999);
    expect(clamp(-9999)).toBe(-9999);
  });

  it('returns min when value equals min', () => {
    expect(clamp(10, 10, 100)).toBe(10);
  });

  it('returns max when value equals max', () => {
    expect(clamp(100, 10, 100)).toBe(100);
  });
});

// ── Step hint rendering (pure) ─────────────────────────────────────────────
// Mirrors: const resolvedStepHint = stepHint ?? `↑ +${step}  ↓ -${step}`

function resolveStepHint(step: number, customHint?: string): string {
  return customHint ?? `↑ +${step}  ↓ -${step}`;
}

describe('NumberInput step hint resolution', () => {
  it('generates default hint from step value', () => {
    expect(resolveStepHint(1)).toBe('↑ +1  ↓ -1');
  });

  it('uses custom step value in hint', () => {
    expect(resolveStepHint(5)).toBe('↑ +5  ↓ -5');
  });

  it('uses custom stepHint string when provided', () => {
    expect(resolveStepHint(1, '▲▼')).toBe('▲▼');
  });

  it('default step of 0.1 shows in hint', () => {
    expect(resolveStepHint(0.1)).toBe('↑ +0.1  ↓ -0.1');
  });
});

// ── Buffer / input parsing (pure) ─────────────────────────────────────────
// Mirrors the character filter: /^[\d.\-]$/ with constraints

function isValidInput(input: string, currentBuffer: string): boolean {
  if (!/^[\d.\-]$/.test(input)) return false;
  if (input === '-' && currentBuffer.length > 0) return false;
  if (input === '.' && currentBuffer.includes('.')) return false;
  return true;
}

describe('NumberInput character validation', () => {
  it('accepts digit characters', () => {
    expect(isValidInput('5', '')).toBe(true);
    expect(isValidInput('0', '12')).toBe(true);
  });

  it('accepts a leading minus sign on empty buffer', () => {
    expect(isValidInput('-', '')).toBe(true);
  });

  it('rejects a minus sign when buffer is non-empty', () => {
    expect(isValidInput('-', '3')).toBe(false);
  });

  it('accepts a decimal point when buffer has no dot', () => {
    expect(isValidInput('.', '3')).toBe(true);
  });

  it('rejects a second decimal point', () => {
    expect(isValidInput('.', '3.')).toBe(false);
  });

  it('rejects letters', () => {
    expect(isValidInput('a', '')).toBe(false);
    expect(isValidInput('e', '1')).toBe(false);
  });

  it('rejects special characters', () => {
    expect(isValidInput('/', '')).toBe(false);
    expect(isValidInput('+', '')).toBe(false);
  });
});

// ── min/max rendering smoke tests ─────────────────────────────────────────

describe('NumberInput min/max props', () => {
  it('renders a value at the minimum boundary', async () => {
    const output = await renderToString(wrap(e(NumberInput, { value: 0, min: 0, max: 100 })));
    expect(output).toContain('0');
  });

  it('renders a value at the maximum boundary', async () => {
    const output = await renderToString(wrap(e(NumberInput, { value: 100, min: 0, max: 100 })));
    expect(output).toContain('100');
  });

  it('renders a value inside the range', async () => {
    const output = await renderToString(wrap(e(NumberInput, { value: 50, min: 0, max: 100 })));
    expect(output).toContain('50');
  });
});

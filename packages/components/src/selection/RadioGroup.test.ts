import { describe, it, expect } from 'vitest';
import { RadioGroup } from './RadioGroup.js';

// ── Export smoke test ──────────────────────────────────────────────────────

describe('RadioGroup export', () => {
  it('is exported as a function', () => {
    expect(typeof RadioGroup).toBe('function');
  });
});

// ── Initial active index ───────────────────────────────────────────────────
// Mirrors the useState initializer for activeIndex in RadioGroup.tsx

interface RadioOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

function resolveInitialIndex<T>(options: RadioOption<T>[], controlledValue: T | undefined): number {
  if (controlledValue === undefined) return 0;
  const idx = options.findIndex((o) => o.value === controlledValue);
  return idx === -1 ? 0 : idx;
}

const OPTIONS: RadioOption[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'auto', label: 'Auto' },
];

describe('resolveInitialIndex', () => {
  it('defaults to 0 when no controlled value', () => {
    expect(resolveInitialIndex(OPTIONS, undefined)).toBe(0);
  });

  it('finds the index of the controlled value', () => {
    expect(resolveInitialIndex(OPTIONS, 'dark')).toBe(1);
    expect(resolveInitialIndex(OPTIONS, 'auto')).toBe(2);
  });

  it('defaults to 0 for an unknown value', () => {
    expect(resolveInitialIndex(OPTIONS, 'unknown')).toBe(0);
  });

  it('finds index 0 for the first option', () => {
    expect(resolveInitialIndex(OPTIONS, 'light')).toBe(0);
  });
});

// ── Navigation — skip disabled ─────────────────────────────────────────────

function moveUp(options: RadioOption[], current: number): number {
  let next = current - 1;
  while (next >= 0 && options[next]?.disabled) next--;
  return next < 0 ? current : next;
}

function moveDown(options: RadioOption[], current: number): number {
  let next = current + 1;
  while (next < options.length && options[next]?.disabled) next++;
  return next >= options.length ? current : next;
}

describe('RadioGroup navigation', () => {
  it('moves up normally', () => {
    expect(moveUp(OPTIONS, 2)).toBe(1);
  });

  it('stays at 0 when moving up from first option', () => {
    expect(moveUp(OPTIONS, 0)).toBe(0);
  });

  it('moves down normally', () => {
    expect(moveDown(OPTIONS, 0)).toBe(1);
  });

  it('stays at last option when moving down from last', () => {
    expect(moveDown(OPTIONS, 2)).toBe(2);
  });

  it('skips disabled options when moving down', () => {
    const opts: RadioOption[] = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true },
      { value: 'c', label: 'C' },
    ];
    expect(moveDown(opts, 0)).toBe(2);
  });

  it('skips disabled options when moving up', () => {
    const opts: RadioOption[] = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true },
      { value: 'c', label: 'C' },
    ];
    expect(moveUp(opts, 2)).toBe(0);
  });
});

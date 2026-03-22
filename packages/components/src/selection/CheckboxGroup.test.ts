import { describe, it, expect } from 'vitest';
import { CheckboxGroup } from './CheckboxGroup.js';

// ── Export smoke test ──────────────────────────────────────────────────────

describe('CheckboxGroup export', () => {
  it('is exported as a function', () => {
    expect(typeof CheckboxGroup).toBe('function');
  });
});

// ── validateAndUpdate logic ────────────────────────────────────────────────
// Mirrors the validation inside CheckboxGroup.tsx

interface ValidationResult {
  error: string | undefined;
  shouldUpdate: boolean;
}

function validateAndUpdate(next: string[], min?: number, max?: number): ValidationResult {
  if (max !== undefined && next.length > max) {
    return { error: `Select at most ${max} option${max === 1 ? '' : 's'}.`, shouldUpdate: false };
  }
  if (min !== undefined && next.length < min) {
    return { error: `Select at least ${min} option${min === 1 ? '' : 's'}.`, shouldUpdate: true };
  }
  return { error: undefined, shouldUpdate: true };
}

describe('validateAndUpdate — no constraints', () => {
  it('allows any selection', () => {
    const result = validateAndUpdate(['a', 'b', 'c']);
    expect(result.error).toBeUndefined();
    expect(result.shouldUpdate).toBe(true);
  });

  it('allows empty selection', () => {
    const result = validateAndUpdate([]);
    expect(result.error).toBeUndefined();
  });
});

describe('validateAndUpdate — max constraint', () => {
  it('allows selection at or below max', () => {
    expect(validateAndUpdate(['a', 'b'], undefined, 3).error).toBeUndefined();
    expect(validateAndUpdate(['a', 'b', 'c'], undefined, 3).error).toBeUndefined();
  });

  it('blocks selection exceeding max and sets error', () => {
    const result = validateAndUpdate(['a', 'b', 'c', 'd'], undefined, 3);
    expect(result.error).toBe('Select at most 3 options.');
    expect(result.shouldUpdate).toBe(false);
  });

  it('uses singular form for max=1', () => {
    const result = validateAndUpdate(['a', 'b'], undefined, 1);
    expect(result.error).toBe('Select at most 1 option.');
  });
});

describe('validateAndUpdate — min constraint', () => {
  it('allows selection at or above min', () => {
    expect(validateAndUpdate(['a', 'b'], 2).error).toBeUndefined();
    expect(validateAndUpdate(['a', 'b', 'c'], 2).error).toBeUndefined();
  });

  it('sets error but still updates when below min', () => {
    const result = validateAndUpdate(['a'], 2);
    expect(result.error).toBe('Select at least 2 options.');
    expect(result.shouldUpdate).toBe(true);
  });

  it('uses singular form for min=1', () => {
    const result = validateAndUpdate([], 1);
    expect(result.error).toBe('Select at least 1 option.');
  });
});

describe('validateAndUpdate — both constraints', () => {
  it('passes when within range', () => {
    const result = validateAndUpdate(['a', 'b'], 1, 3);
    expect(result.error).toBeUndefined();
  });

  it('blocks on max before checking min', () => {
    // max is checked first in the source
    const result = validateAndUpdate(['a', 'b', 'c', 'd'], 1, 3);
    expect(result.error).toBe('Select at most 3 options.');
    expect(result.shouldUpdate).toBe(false);
  });
});

// ── Toggle selection ───────────────────────────────────────────────────────

function toggleOption(selected: string[], value: string): string[] {
  const isSelected = selected.includes(value);
  return isSelected ? selected.filter((v) => v !== value) : [...selected, value];
}

describe('toggleOption', () => {
  it('adds an unselected item', () => {
    expect(toggleOption(['a'], 'b')).toEqual(['a', 'b']);
  });

  it('removes a selected item', () => {
    expect(toggleOption(['a', 'b'], 'a')).toEqual(['b']);
  });

  it('works on an empty list', () => {
    expect(toggleOption([], 'x')).toEqual(['x']);
  });
});

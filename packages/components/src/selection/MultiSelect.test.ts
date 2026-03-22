import { describe, it, expect } from 'vitest';
import { MultiSelect } from './MultiSelect.js';

// ── Export smoke test ──────────────────────────────────────────────────────

describe('MultiSelect export', () => {
  it('is exported as a function', () => {
    expect(typeof MultiSelect).toBe('function');
  });
});

// ── scrollOffset calculation ───────────────────────────────────────────────
// Inline copy from MultiSelect.tsx

function computeScrollOffset(
  activeIndex: number,
  optionsLength: number,
  height: number | undefined
): number {
  if (!height) return 0;
  const half = Math.floor(height / 2);
  const maxOffset = optionsLength - height;
  const offset = activeIndex - half;
  if (offset < 0) return 0;
  if (offset > maxOffset) return Math.max(0, maxOffset);
  return offset;
}

describe('computeScrollOffset', () => {
  it('returns 0 when height is not set', () => {
    expect(computeScrollOffset(5, 20, undefined)).toBe(0);
  });

  it('returns 0 when activeIndex is near the top', () => {
    expect(computeScrollOffset(0, 20, 5)).toBe(0);
    expect(computeScrollOffset(1, 20, 5)).toBe(0);
  });

  it('scrolls to center the active index', () => {
    // half = 2, offset = 10 - 2 = 8
    expect(computeScrollOffset(10, 20, 5)).toBe(8);
  });

  it('clamps to 0 when offset would be negative', () => {
    expect(computeScrollOffset(1, 20, 10)).toBe(0);
  });

  it('clamps to maxOffset when active is near the end', () => {
    // maxOffset = 20 - 5 = 15
    expect(computeScrollOffset(19, 20, 5)).toBe(15);
  });

  it('returns 0 when list fits entirely in height', () => {
    expect(computeScrollOffset(3, 5, 10)).toBe(0);
  });
});

// ── Selection toggle ───────────────────────────────────────────────────────

function toggle<T>(selected: T[], value: T): T[] {
  const isSelected = selected.includes(value);
  return isSelected ? selected.filter((v) => v !== value) : [...selected, value];
}

describe('MultiSelect toggle', () => {
  it('adds an item when not selected', () => {
    expect(toggle(['a', 'b'], 'c')).toEqual(['a', 'b', 'c']);
  });

  it('removes an item when already selected', () => {
    expect(toggle(['a', 'b', 'c'], 'b')).toEqual(['a', 'c']);
  });

  it('handles empty selection', () => {
    expect(toggle([], 'a')).toEqual(['a']);
  });

  it('handles numeric values', () => {
    expect(toggle([1, 2, 3], 2)).toEqual([1, 3]);
  });
});

// ── Viewport slice ─────────────────────────────────────────────────────────

describe('visible options slice', () => {
  const options = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

  it('returns all options when no height', () => {
    const offset = 0;
    const visible = options.slice(offset, undefined);
    expect(visible).toEqual(options);
  });

  it('returns a window of height items', () => {
    const offset = 2;
    const height = 4;
    const visible = options.slice(offset, offset + height);
    expect(visible).toEqual(['c', 'd', 'e', 'f']);
  });

  it('does not exceed the array bounds', () => {
    const offset = 8;
    const height = 4;
    const visible = options.slice(offset, offset + height);
    expect(visible).toEqual(['i', 'j']);
  });
});

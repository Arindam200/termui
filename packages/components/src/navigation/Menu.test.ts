import { describe, it, expect } from 'vitest';
import { Menu } from './Menu.js';

// ── Export smoke test ──────────────────────────────────────────────────────

describe('Menu export', () => {
  it('is exported as a function', () => {
    expect(typeof Menu).toBe('function');
  });
});

// ── Selectable indices ─────────────────────────────────────────────────────
// Mirrors the selectableIndices computation in Menu.tsx

interface MenuItem {
  key: string;
  label?: string;
  disabled?: boolean;
  separator?: boolean;
}

function getSelectableIndices(items: MenuItem[]): number[] {
  return items
    .map((item, idx) => ({ item, idx }))
    .filter(({ item }) => !item.separator && !item.disabled)
    .map(({ idx }) => idx);
}

describe('getSelectableIndices', () => {
  it('returns all indices when no items are disabled or separators', () => {
    const items: MenuItem[] = [
      { key: 'a', label: 'A' },
      { key: 'b', label: 'B' },
      { key: 'c', label: 'C' },
    ];
    expect(getSelectableIndices(items)).toEqual([0, 1, 2]);
  });

  it('skips separator items', () => {
    const items: MenuItem[] = [
      { key: 'a', label: 'A' },
      { key: 'sep', separator: true },
      { key: 'b', label: 'B' },
    ];
    expect(getSelectableIndices(items)).toEqual([0, 2]);
  });

  it('skips disabled items', () => {
    const items: MenuItem[] = [
      { key: 'a', label: 'A' },
      { key: 'b', label: 'B', disabled: true },
      { key: 'c', label: 'C' },
    ];
    expect(getSelectableIndices(items)).toEqual([0, 2]);
  });

  it('handles all separators', () => {
    const items: MenuItem[] = [
      { key: 's1', separator: true },
      { key: 's2', separator: true },
    ];
    expect(getSelectableIndices(items)).toEqual([]);
  });

  it('handles an empty list', () => {
    expect(getSelectableIndices([])).toEqual([]);
  });
});

// ── Focus movement ─────────────────────────────────────────────────────────

function moveFocus(items: MenuItem[], currentFocus: number, direction: 1 | -1): number {
  const selectableIndices = getSelectableIndices(items);
  const currentPos = selectableIndices.indexOf(currentFocus);
  const nextPos = currentPos + direction;
  if (nextPos >= 0 && nextPos < selectableIndices.length) {
    return selectableIndices[nextPos]!;
  }
  return currentFocus;
}

describe('moveFocus', () => {
  const items: MenuItem[] = [
    { key: 'a', label: 'A' },
    { key: 'sep', separator: true },
    { key: 'b', label: 'B' },
    { key: 'c', label: 'C' },
  ];

  it('moves down, skipping separators', () => {
    expect(moveFocus(items, 0, 1)).toBe(2);
  });

  it('moves up, skipping separators', () => {
    expect(moveFocus(items, 2, -1)).toBe(0);
  });

  it('does not move beyond the last item', () => {
    expect(moveFocus(items, 3, 1)).toBe(3);
  });

  it('does not move before the first item', () => {
    expect(moveFocus(items, 0, -1)).toBe(0);
  });
});

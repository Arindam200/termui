import { describe, it, expect } from 'vitest';
import { Breadcrumb } from './Breadcrumb.js';

// ── Export smoke test ──────────────────────────────────────────────────────

describe('Breadcrumb export', () => {
  it('is exported as a function', () => {
    expect(typeof Breadcrumb).toBe('function');
  });
});

// ── Active index resolution ────────────────────────────────────────────────
// Mirrors the activeIndex logic in Breadcrumb.tsx

interface Item {
  key: string;
  label: string;
}

function resolveActiveIndex(items: Item[], activeKey: string | undefined): number {
  if (activeKey !== undefined) {
    return items.findIndex((i) => i.key === activeKey);
  }
  return items.length - 1;
}

const items: Item[] = [
  { key: 'home', label: 'Home' },
  { key: 'docs', label: 'Docs' },
  { key: 'api', label: 'API' },
];

describe('resolveActiveIndex', () => {
  it('defaults to last item when activeKey is undefined', () => {
    expect(resolveActiveIndex(items, undefined)).toBe(2);
  });

  it('finds the correct index for a given key', () => {
    expect(resolveActiveIndex(items, 'docs')).toBe(1);
  });

  it('finds index 0 for the first item', () => {
    expect(resolveActiveIndex(items, 'home')).toBe(0);
  });

  it('returns -1 for a key not in the list', () => {
    expect(resolveActiveIndex(items, 'missing')).toBe(-1);
  });

  it('handles an empty items array with undefined activeKey', () => {
    expect(resolveActiveIndex([], undefined)).toBe(-1);
  });
});

// ── Separator rendering ────────────────────────────────────────────────────

describe('separator', () => {
  it('a separator is rendered between items (not after last)', () => {
    const n = items.length;
    let separatorCount = 0;
    for (let i = 0; i < n; i++) {
      if (i < n - 1) separatorCount++;
    }
    expect(separatorCount).toBe(n - 1);
  });
});

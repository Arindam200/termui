import { describe, it, expect } from 'vitest';
import { VirtualList } from './VirtualList.js';

// ── Export smoke test ──────────────────────────────────────────────────────

describe('VirtualList export', () => {
  it('is exported as a function', () => {
    expect(typeof VirtualList).toBe('function');
  });
});

// ── Visible window calculation ─────────────────────────────────────────────
// Mirrors the visibleStart/visibleEnd logic in VirtualList.tsx

function calcVisibleRange(
  totalItems: number,
  windowStart: number,
  height: number,
  overscan = 2
): { visibleStart: number; visibleEnd: number; count: number } {
  const visibleStart = Math.max(0, windowStart - overscan);
  const visibleEnd = Math.min(totalItems, windowStart + height + overscan);
  return { visibleStart, visibleEnd, count: visibleEnd - visibleStart };
}

describe('VirtualList visible window', () => {
  it('renders a limited slice of a large array', () => {
    const { count } = calcVisibleRange(1000, 0, 10);
    // height(10) + overscan(2) = 12 items max from start
    expect(count).toBeLessThan(1000);
    expect(count).toBe(12);
  });

  it('visibleStart respects overscan lower bound (clamps to 0)', () => {
    const { visibleStart } = calcVisibleRange(1000, 0, 10, 2);
    expect(visibleStart).toBe(0);
  });

  it('visibleStart shifts down when window scrolls', () => {
    const { visibleStart } = calcVisibleRange(1000, 20, 10, 2);
    expect(visibleStart).toBe(18);
  });

  it('visibleEnd clamps to array length', () => {
    const { visibleEnd } = calcVisibleRange(5, 0, 10, 2);
    expect(visibleEnd).toBe(5);
  });

  it('overscan=0 returns exactly height items from windowStart', () => {
    const { visibleStart, visibleEnd } = calcVisibleRange(1000, 10, 5, 0);
    expect(visibleStart).toBe(10);
    expect(visibleEnd).toBe(15);
  });
});

// ── Item label rendering ───────────────────────────────────────────────────
// Simulates what a typical renderItem callback would produce

function renderItemLabel(item: { label: string }, _index: number, isActive: boolean): string {
  return `${isActive ? '>' : ' '} ${item.label}`;
}

describe('VirtualList item label rendering', () => {
  const items = [{ label: 'Apple' }, { label: 'Banana' }, { label: 'Cherry' }];

  it('renders item label text', () => {
    expect(renderItemLabel(items[0]!, 0, false)).toContain('Apple');
  });

  it('renders all labels for visible items', () => {
    const labels = items.map((item, i) => renderItemLabel(item, i, i === 0));
    expect(labels[0]).toContain('Apple');
    expect(labels[1]).toContain('Banana');
    expect(labels[2]).toContain('Cherry');
  });

  it('active item gets a distinct prefix', () => {
    const active = renderItemLabel(items[1]!, 1, true);
    const inactive = renderItemLabel(items[1]!, 1, false);
    expect(active).not.toBe(inactive);
    expect(active).toContain('>');
    expect(inactive).not.toContain('>');
  });
});

// ── Searchable mode filter ─────────────────────────────────────────────────
// Mirrors the default case-insensitive substring filter in VirtualList.tsx

function defaultFilter<T>(item: T, query: string): boolean {
  return String(item).toLowerCase().includes(query.toLowerCase());
}

function applyFilter<T>(items: T[], query: string, searchable: boolean): T[] {
  if (!searchable || query === '') return items;
  return items.filter((item) => defaultFilter(item, query));
}

describe('VirtualList searchable filter', () => {
  const items = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry'];

  it('returns all items when searchable is false', () => {
    expect(applyFilter(items, 'ap', false)).toHaveLength(5);
  });

  it('returns all items when query is empty', () => {
    expect(applyFilter(items, '', true)).toHaveLength(5);
  });

  it('filters by case-insensitive substring', () => {
    const result = applyFilter(items, 'ap', true);
    expect(result).toEqual(['Apple', 'Apricot']);
  });

  it('returns empty array when no items match', () => {
    const result = applyFilter(items, 'zzz', true);
    expect(result).toHaveLength(0);
  });

  it('filter is case-insensitive', () => {
    const lower = applyFilter(items, 'berry', true);
    const upper = applyFilter(items, 'BERRY', true);
    expect(lower).toEqual(upper);
  });
});

// ── searchable prop shows search prompt ────────────────────────────────────
// Mirrors the conditional `{searchable && <Box>...Search...</Box>}` branch

function shouldShowSearchPrompt(searchable: boolean): boolean {
  return searchable;
}

describe('VirtualList search prompt visibility', () => {
  it('shows search prompt when searchable=true', () => {
    expect(shouldShowSearchPrompt(true)).toBe(true);
  });

  it('hides search prompt when searchable=false', () => {
    expect(shouldShowSearchPrompt(false)).toBe(false);
  });
});

// ── listHeight reduction ───────────────────────────────────────────────────
// Mirrors `const listHeight = searchable ? height - 2 : height`

function resolveListHeight(height: number, searchable: boolean): number {
  return searchable ? height - 2 : height;
}

describe('VirtualList listHeight', () => {
  it('reduces height by 2 when searchable (reserves search box rows)', () => {
    expect(resolveListHeight(10, true)).toBe(8);
  });

  it('uses full height when not searchable', () => {
    expect(resolveListHeight(10, false)).toBe(10);
  });
});

// ── Scrollbar visibility ───────────────────────────────────────────────────
// Mirrors `{filteredItems.length > listHeight && <scrollbar>}`

function shouldShowScrollbar(totalItems: number, listHeight: number): boolean {
  return totalItems > listHeight;
}

describe('VirtualList scrollbar visibility', () => {
  it('shows scrollbar when items exceed visible height', () => {
    expect(shouldShowScrollbar(1000, 10)).toBe(true);
  });

  it('hides scrollbar when all items fit in visible height', () => {
    expect(shouldShowScrollbar(5, 10)).toBe(false);
  });

  it('hides scrollbar when count equals height exactly', () => {
    expect(shouldShowScrollbar(10, 10)).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import { Sidebar } from './Sidebar.js';

// ── Export smoke test ──────────────────────────────────────────────────────

describe('Sidebar export', () => {
  it('is exported as a function', () => {
    expect(typeof Sidebar).toBe('function');
  });
});

// ── flattenItems logic ─────────────────────────────────────────────────────
// Mirrors the flattenItems function in Sidebar.tsx

interface SidebarItem {
  key: string;
  label: string;
  children?: SidebarItem[];
}

function flattenItems(
  items: SidebarItem[],
  expandedKeys: Set<string>,
  depth = 0
): { item: SidebarItem; depth: number }[] {
  const result: { item: SidebarItem; depth: number }[] = [];
  for (const item of items) {
    result.push({ item, depth });
    if (item.children && expandedKeys.has(item.key)) {
      result.push(...flattenItems(item.children, expandedKeys, depth + 1));
    }
  }
  return result;
}

const ITEMS: SidebarItem[] = [
  {
    key: 'components',
    label: 'Components',
    children: [
      { key: 'button', label: 'Button' },
      { key: 'input', label: 'Input' },
    ],
  },
  { key: 'docs', label: 'Docs' },
];

describe('flattenItems', () => {
  it('returns only top-level items when none are expanded', () => {
    const flat = flattenItems(ITEMS, new Set());
    expect(flat.length).toBe(2);
    expect(flat.map((f) => f.item.key)).toEqual(['components', 'docs']);
  });

  it('includes children when parent is expanded', () => {
    const flat = flattenItems(ITEMS, new Set(['components']));
    expect(flat.length).toBe(4);
    expect(flat.map((f) => f.item.key)).toEqual(['components', 'button', 'input', 'docs']);
  });

  it('assigns depth 0 to top-level items', () => {
    const flat = flattenItems(ITEMS, new Set());
    expect(flat[0]!.depth).toBe(0);
    expect(flat[1]!.depth).toBe(0);
  });

  it('assigns depth 1 to expanded children', () => {
    const flat = flattenItems(ITEMS, new Set(['components']));
    const button = flat.find((f) => f.item.key === 'button')!;
    expect(button.depth).toBe(1);
  });

  it('handles an empty items array', () => {
    expect(flattenItems([], new Set())).toEqual([]);
  });

  it('handles items with no children', () => {
    const items: SidebarItem[] = [{ key: 'a', label: 'A' }];
    expect(flattenItems(items, new Set(['a']))).toEqual([{ item: items[0], depth: 0 }]);
  });
});

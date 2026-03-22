import { describe, it, expect } from 'vitest';
import { TreeSelect } from './TreeSelect.js';

// ── Export smoke test ──────────────────────────────────────────────────────

describe('TreeSelect export', () => {
  it('is exported as a function', () => {
    expect(typeof TreeSelect).toBe('function');
  });
});

// ── flatten ────────────────────────────────────────────────────────────────
// Inline copy from TreeSelect.tsx

interface TreeSelectNode<T = string> {
  value: T;
  label: string;
  children?: TreeSelectNode<T>[];
  disabled?: boolean;
}

interface FlatNode<T> {
  node: TreeSelectNode<T>;
  depth: number;
  path: string;
  hasChildren: boolean;
}

function flatten<T>(
  nodes: TreeSelectNode<T>[],
  depth: number,
  expanded: Set<string>,
  pathPrefix: string,
  expandedByDefault: boolean
): FlatNode<T>[] {
  const result: FlatNode<T>[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!;
    const path = `${pathPrefix}/${i}`;
    const hasChildren = !!(node.children && node.children.length > 0);
    result.push({ node, depth, path, hasChildren });

    if (hasChildren) {
      const isExpanded =
        expanded.has(path) || (expandedByDefault && !expanded.has(path + ':collapsed'));
      if (isExpanded) {
        result.push(...flatten(node.children!, depth + 1, expanded, path, expandedByDefault));
      }
    }
  }
  return result;
}

const TREE: TreeSelectNode[] = [
  {
    value: 'fruits',
    label: 'Fruits',
    children: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
    ],
  },
  { value: 'vegs', label: 'Vegetables' },
];

describe('flatten — collapsed', () => {
  it('returns only top-level nodes when nothing is expanded', () => {
    const flat = flatten(TREE, 0, new Set(), '', false);
    expect(flat.length).toBe(2);
    expect(flat.map((f) => f.node.value)).toEqual(['fruits', 'vegs']);
  });

  it('assigns depth 0 to root nodes', () => {
    const flat = flatten(TREE, 0, new Set(), '', false);
    expect(flat[0]!.depth).toBe(0);
    expect(flat[1]!.depth).toBe(0);
  });

  it('marks parent nodes as hasChildren=true', () => {
    const flat = flatten(TREE, 0, new Set(), '', false);
    expect(flat[0]!.hasChildren).toBe(true);
  });

  it('marks leaf nodes as hasChildren=false', () => {
    const flat = flatten(TREE, 0, new Set(), '', false);
    expect(flat[1]!.hasChildren).toBe(false);
  });
});

describe('flatten — expanded via Set', () => {
  it('includes children when parent path is in expanded set', () => {
    // Root node 'fruits' has path '/0'
    const flat = flatten(TREE, 0, new Set(['/0']), '', false);
    expect(flat.length).toBe(4); // fruits, apple, banana, vegs
    expect(flat.map((f) => f.node.value)).toEqual(['fruits', 'apple', 'banana', 'vegs']);
  });

  it('assigns depth 1 to children', () => {
    const flat = flatten(TREE, 0, new Set(['/0']), '', false);
    const apple = flat.find((f) => f.node.value === 'apple')!;
    expect(apple.depth).toBe(1);
  });

  it('does not include children when parent is not expanded', () => {
    const flat = flatten(TREE, 0, new Set(), '', false);
    expect(flat.find((f) => f.node.value === 'apple')).toBeUndefined();
  });
});

describe('flatten — expandedByDefault', () => {
  it('expands all nodes by default when expandedByDefault=true', () => {
    const flat = flatten(TREE, 0, new Set(), '', true);
    expect(flat.length).toBe(4);
  });

  it('can collapse a node via the :collapsed marker', () => {
    // Mark /0 as collapsed while expandedByDefault is true
    const flat = flatten(TREE, 0, new Set(['/0:collapsed']), '', true);
    // Only root nodes visible — fruits collapsed
    expect(flat.length).toBe(2);
  });
});

describe('flatten — paths', () => {
  it('generates sequential paths at root level', () => {
    const flat = flatten(TREE, 0, new Set(), '', false);
    expect(flat[0]!.path).toBe('/0');
    expect(flat[1]!.path).toBe('/1');
  });

  it('generates nested paths for children', () => {
    const flat = flatten(TREE, 0, new Set(['/0']), '', false);
    const apple = flat.find((f) => f.node.value === 'apple')!;
    expect(apple.path).toBe('/0/0');
    const banana = flat.find((f) => f.node.value === 'banana')!;
    expect(banana.path).toBe('/0/1');
  });
});

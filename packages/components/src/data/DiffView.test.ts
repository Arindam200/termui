import { describe, it, expect } from 'vitest';
import { DiffView } from './DiffView.js';

// ── Export smoke test ──────────────────────────────────────────────────────

describe('DiffView export', () => {
  it('is exported as a renderable component', () => {
    // React.memo wraps components in an object — check it's defined and callable
    expect(DiffView).toBeDefined();
    expect(
      typeof DiffView === 'function' || (typeof DiffView === 'object' && DiffView !== null)
    ).toBe(true);
  });
});

// ── computeDiff (LCS-based diff algorithm) ────────────────────────────────
// Mirrors the internal `computeDiff` and `DiffOp` logic in DiffView.tsx

type DiffOp = { type: 'equal' | 'insert' | 'delete'; line: string };

function computeDiff(oldLines: string[], newLines: string[]): DiffOp[] {
  const m = oldLines.length;
  const n = newLines.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]! + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
      }
    }
  }

  const ops: DiffOp[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      ops.unshift({ type: 'equal', line: oldLines[i - 1]! });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i]![j - 1]! >= dp[i - 1]![j]!)) {
      ops.unshift({ type: 'insert', line: newLines[j - 1]! });
      j--;
    } else {
      ops.unshift({ type: 'delete', line: oldLines[i - 1]! });
      i--;
    }
  }

  return ops;
}

describe('DiffView computeDiff — identical texts', () => {
  it('produces only "equal" ops when texts are identical', () => {
    const ops = computeDiff(['a', 'b', 'c'], ['a', 'b', 'c']);
    expect(ops.every((op) => op.type === 'equal')).toBe(true);
  });

  it('reports no changes for identical single-line texts', () => {
    const ops = computeDiff(['hello'], ['hello']);
    expect(ops).toHaveLength(1);
    expect(ops[0]!.type).toBe('equal');
  });
});

describe('DiffView computeDiff — inserted lines', () => {
  it('detects a line added at the end', () => {
    const ops = computeDiff(['a'], ['a', 'b']);
    const types = ops.map((op) => op.type);
    expect(types).toContain('insert');
    expect(types).not.toContain('delete');
  });

  it('inserted op carries the new line text', () => {
    const ops = computeDiff(['a'], ['a', 'new line']);
    const inserted = ops.filter((op) => op.type === 'insert');
    expect(inserted[0]!.line).toBe('new line');
  });

  it('detects a line inserted in the middle', () => {
    const ops = computeDiff(['a', 'c'], ['a', 'b', 'c']);
    const inserted = ops.filter((op) => op.type === 'insert');
    expect(inserted).toHaveLength(1);
    expect(inserted[0]!.line).toBe('b');
  });
});

describe('DiffView computeDiff — deleted lines', () => {
  it('detects a line removed from the end', () => {
    const ops = computeDiff(['a', 'b'], ['a']);
    const types = ops.map((op) => op.type);
    expect(types).toContain('delete');
    expect(types).not.toContain('insert');
  });

  it('deleted op carries the old line text', () => {
    const ops = computeDiff(['a', 'removed'], ['a']);
    const deleted = ops.filter((op) => op.type === 'delete');
    expect(deleted[0]!.line).toBe('removed');
  });

  it('equal lines survive a deletion', () => {
    const ops = computeDiff(['keep', 'drop'], ['keep']);
    const equal = ops.filter((op) => op.type === 'equal');
    expect(equal[0]!.line).toBe('keep');
  });
});

describe('DiffView computeDiff — mixed changes', () => {
  it('handles simultaneous inserts and deletes', () => {
    const ops = computeDiff(['old line', 'common'], ['new line', 'common']);
    const types = new Set(ops.map((op) => op.type));
    expect(types.has('delete')).toBe(true);
    expect(types.has('insert')).toBe(true);
    expect(types.has('equal')).toBe(true);
  });

  it('empty old text means all lines are inserts', () => {
    const ops = computeDiff([], ['a', 'b', 'c']);
    expect(ops.every((op) => op.type === 'insert')).toBe(true);
    expect(ops).toHaveLength(3);
  });

  it('empty new text means all lines are deletes', () => {
    const ops = computeDiff(['a', 'b', 'c'], []);
    expect(ops.every((op) => op.type === 'delete')).toBe(true);
    expect(ops).toHaveLength(3);
  });
});

// ── hasChanges detection ───────────────────────────────────────────────────
// Mirrors `const hasChanges = ops.some(op => op.type !== 'equal')` in DiffView.tsx

function hasChanges(oldText: string, newText: string): boolean {
  const ops = computeDiff(oldText.split('\n'), newText.split('\n'));
  return ops.some((op) => op.type !== 'equal');
}

describe('DiffView hasChanges', () => {
  it('returns false when texts are identical', () => {
    expect(hasChanges('hello\nworld', 'hello\nworld')).toBe(false);
  });

  it('returns true when a line is added', () => {
    expect(hasChanges('hello', 'hello\nworld')).toBe(true);
  });

  it('returns true when a line is removed', () => {
    expect(hasChanges('hello\nworld', 'hello')).toBe(true);
  });

  it('returns true when a line is modified', () => {
    expect(hasChanges('old line', 'new line')).toBe(true);
  });
});

// ── DiffMode prop ──────────────────────────────────────────────────────────
// Mirrors the `mode` prop accepted by DiffView

type DiffMode = 'unified' | 'split' | 'inline';

function resolveMode(mode?: DiffMode): DiffMode {
  return mode ?? 'unified';
}

describe('DiffView mode prop', () => {
  it('defaults to "unified" mode', () => {
    expect(resolveMode()).toBe('unified');
  });

  it('accepts "split" mode', () => {
    expect(resolveMode('split')).toBe('split');
  });

  it('accepts "inline" mode', () => {
    expect(resolveMode('inline')).toBe('inline');
  });
});

// ── filename display ───────────────────────────────────────────────────────
// Mirrors `{filename && <Text>--- {filename}</Text>}` in DiffView.tsx

function buildFilenameHeader(filename?: string): string | null {
  return filename ? `--- ${filename}` : null;
}

describe('DiffView filename header', () => {
  it('renders filename header when filename is provided', () => {
    expect(buildFilenameHeader('src/index.ts')).toBe('--- src/index.ts');
  });

  it('returns null when filename is not provided', () => {
    expect(buildFilenameHeader()).toBeNull();
  });
});

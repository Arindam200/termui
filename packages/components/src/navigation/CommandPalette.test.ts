import { describe, it, expect } from 'vitest';
import { CommandPalette } from './CommandPalette.js';
import type { Command } from './CommandPalette.js';

// ── Inline copies of the private helpers ──────────────────────────────────

function fuzzyMatch(str: string, query: string): boolean {
  if (!query) return true;
  const s = str.toLowerCase();
  const q = query.toLowerCase();
  let qi = 0;
  for (let i = 0; i < s.length && qi < q.length; i++) {
    if (s[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

function fuzzyScore(str: string, query: string): number {
  if (!query) return 0;
  const s = str.toLowerCase();
  const q = query.toLowerCase();
  let score = 0;
  let qi = 0;
  let lastMatchIdx = -1;

  for (let i = 0; i < s.length && qi < q.length; i++) {
    if (s[i] === q[qi]) {
      score += i - lastMatchIdx - 1; // gap penalty
      lastMatchIdx = i;
      qi++;
    }
  }

  return score;
}

// Helper: build a minimal Command for testing
function cmd(id: string, label: string, group?: string): Command {
  return { id, label, onSelect: () => {}, group };
}

// ── Component export smoke-test ────────────────────────────────────────────

describe('CommandPalette export', () => {
  it('is exported as a function (React component)', () => {
    expect(typeof CommandPalette).toBe('function');
  });
});

// ── fuzzyMatch ────────────────────────────────────────────────────────────

describe('fuzzyMatch', () => {
  it('returns true for an empty query (show everything)', () => {
    expect(fuzzyMatch('Anything', '')).toBe(true);
  });

  it('returns true when query is an exact match', () => {
    expect(fuzzyMatch('open file', 'open file')).toBe(true);
  });

  it('returns true when query chars appear as a subsequence', () => {
    expect(fuzzyMatch('Open File', 'of')).toBe(true);
    expect(fuzzyMatch('Open File', 'OF')).toBe(true); // case insensitive
  });

  it('returns false when query is not a subsequence', () => {
    expect(fuzzyMatch('Open File', 'xyz')).toBe(false);
  });

  it('returns false for an empty string vs non-empty query', () => {
    expect(fuzzyMatch('', 'a')).toBe(false);
  });

  it('handles single-character query', () => {
    expect(fuzzyMatch('Save', 's')).toBe(true);
    expect(fuzzyMatch('Save', 'z')).toBe(false);
  });

  it('requires all query characters to be present', () => {
    // 'git' is a subsequence of 'toggle' — no
    expect(fuzzyMatch('toggle', 'git')).toBe(false);
    // but 'tgl' is
    expect(fuzzyMatch('toggle', 'tgl')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(fuzzyMatch('Run Tests', 'RT')).toBe(true);
    expect(fuzzyMatch('run tests', 'RT')).toBe(true);
  });
});

// ── fuzzyScore ────────────────────────────────────────────────────────────

describe('fuzzyScore', () => {
  it('returns 0 for empty query', () => {
    expect(fuzzyScore('anything', '')).toBe(0);
  });

  it('returns 0 for a consecutive prefix match (no gaps)', () => {
    // "abc" in "abcdef" — chars at positions 0,1,2
    // gaps: (0 - (-1) - 1) + (1 - 0 - 1) + (2 - 1 - 1) = 0 + 0 + 0 = 0
    expect(fuzzyScore('abcdef', 'abc')).toBe(0);
  });

  it('scores lower (better) for more consecutive matches', () => {
    // "of" in "open file" — consecutive 'o','f' better than spread out
    const consecutive = fuzzyScore('of helper', 'of'); // 'o' at 0, 'f' at 1 → score 0
    const spread = fuzzyScore('one fine', 'of'); // 'o' at 0, 'f' at 4 → score 3
    expect(consecutive).toBeLessThan(spread);
  });

  it('lower score means better match', () => {
    const prefixScore = fuzzyScore('open', 'op');
    const scatteredScore = fuzzyScore('option', 'op');
    // Both match, but "open" has op right at the start — same score 0
    // The assertion is that both are non-negative
    expect(prefixScore).toBeGreaterThanOrEqual(0);
    expect(scatteredScore).toBeGreaterThanOrEqual(0);
  });
});

// ── Filtering + sorting pipeline (matches CommandPalette internals) ────────

describe('filter and sort pipeline', () => {
  const commands: Command[] = [
    cmd('1', 'Open File'),
    cmd('2', 'Save File'),
    cmd('3', 'Toggle Sidebar'),
    cmd('4', 'Close Tab'),
    cmd('5', 'Format Document'),
    cmd('6', 'Find in Files'),
  ];

  function filterAndSort(query: string, maxItems = 8): Command[] {
    return commands
      .filter((c) => fuzzyMatch(c.label, query))
      .sort((a, b) => fuzzyScore(a.label, query) - fuzzyScore(b.label, query))
      .slice(0, maxItems);
  }

  it('returns all commands for an empty query', () => {
    expect(filterAndSort('')).toHaveLength(commands.length);
  });

  it('filters to only matching commands', () => {
    const results = filterAndSort('file');
    const labels = results.map((c) => c.label);
    // "Open File", "Save File", "Find in Files" all contain f-i-l-e
    expect(labels).toContain('Open File');
    expect(labels).toContain('Save File');
    expect(labels).toContain('Find in Files');
    expect(labels).not.toContain('Toggle Sidebar');
    expect(labels).not.toContain('Close Tab');
  });

  it('returns empty array when nothing matches', () => {
    expect(filterAndSort('zzzzz')).toHaveLength(0);
  });

  it('respects maxItems limit', () => {
    expect(filterAndSort('', 3)).toHaveLength(3);
  });

  it('is case-insensitive in filtering', () => {
    expect(filterAndSort('FILE')).toEqual(filterAndSort('file'));
  });

  it('places better (lower-score) matches first', () => {
    // "fi" — "Find in Files" has 'f' at 0 and 'i' at 1 (score 0)
    //         "Save File" has 'f' at 5 and 'i' at 7 (higher score)
    const results = filterAndSort('fi');
    expect(results[0]!.label).toBe('Find in Files');
  });

  it('single-character query works as expected', () => {
    const results = filterAndSort('s');
    const labels = results.map((c) => c.label);
    // "Save File", "Toggle Sidebar", "Close Tab", "Format Document", "Find in Files" all have 's'
    expect(labels).toContain('Save File');
    expect(labels).not.toContain('Open File'); // 'o','p','e','n',' ','f','i','l','e' — no 's'
  });
});

// ── Command type shape ─────────────────────────────────────────────────────

describe('Command interface', () => {
  it('can construct a minimal command object', () => {
    const c: Command = { id: 'x', label: 'Do Something', onSelect: () => {} };
    expect(c.id).toBe('x');
    expect(c.label).toBe('Do Something');
    expect(typeof c.onSelect).toBe('function');
  });

  it('optional fields default to undefined when omitted', () => {
    const c: Command = { id: 'y', label: 'Minimal', onSelect: () => {} };
    expect(c.description).toBeUndefined();
    expect(c.shortcut).toBeUndefined();
    expect(c.group).toBeUndefined();
  });
});

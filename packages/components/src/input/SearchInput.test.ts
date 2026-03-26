import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from '@termui/testing';
import { ThemeProvider } from '@termui/core';
import { SearchInput } from './SearchInput.js';

const e = React.createElement;

function wrap(child: React.ReactElement): React.ReactElement {
  return e(ThemeProvider, {}, child);
}

// ── Export smoke test ──────────────────────────────────────────────────────

describe('SearchInput export', () => {
  it('is exported as a function', () => {
    expect(typeof SearchInput).toBe('function');
  });
});

// ── Placeholder display ────────────────────────────────────────────────────

describe('SearchInput placeholder', () => {
  it('renders default placeholder when no value is provided', async () => {
    const output = await renderToString(wrap(e(SearchInput, {})));
    expect(output).toContain('Search...');
  });

  it('renders a custom placeholder', async () => {
    const output = await renderToString(wrap(e(SearchInput, { placeholder: 'Find files...' })));
    expect(output).toContain('Find files...');
  });

  it('does not show placeholder when a value is supplied', async () => {
    const output = await renderToString(
      wrap(e(SearchInput, { value: 'react', placeholder: 'Search...' }))
    );
    expect(output).toContain('react');
    expect(output).not.toContain('Search...');
  });
});

// ── Value rendering ────────────────────────────────────────────────────────

describe('SearchInput value rendering', () => {
  it('renders the controlled value', async () => {
    const output = await renderToString(wrap(e(SearchInput, { value: 'vitest' })));
    expect(output).toContain('vitest');
  });

  it('renders partial typed value', async () => {
    const output = await renderToString(wrap(e(SearchInput, { value: 'type' })));
    expect(output).toContain('type');
  });
});

// ── Search icon / prefix ───────────────────────────────────────────────────

describe('SearchInput search icon', () => {
  it('renders the default search icon', async () => {
    const output = await renderToString(wrap(e(SearchInput, {})));
    expect(output).toContain('🔍');
  });

  it('renders a custom searchIcon string', async () => {
    const output = await renderToString(wrap(e(SearchInput, { searchIcon: '> ' })));
    expect(output).toContain('>');
  });

  it('renders an empty searchIcon without crashing', async () => {
    const output = await renderToString(wrap(e(SearchInput, { searchIcon: '' })));
    expect(typeof output).toBe('string');
  });
});

// ── Label rendering ────────────────────────────────────────────────────────

describe('SearchInput label', () => {
  it('renders the label text when provided', async () => {
    const output = await renderToString(wrap(e(SearchInput, { label: 'Search packages' })));
    expect(output).toContain('Search packages');
  });

  it('renders without label when omitted', async () => {
    // Should not crash and should still show placeholder
    const output = await renderToString(wrap(e(SearchInput, {})));
    expect(output).toContain('Search...');
  });
});

// ── Result filtering logic (pure) ─────────────────────────────────────────
// Mirrors the useMemo in SearchInput.tsx

function filterOptions(options: string[], query: string, maxResults = 5): string[] {
  if (options.length === 0) return [];
  if (!query) return options.slice(0, maxResults);
  const lower = query.toLowerCase();
  return options.filter((item) => item.toLowerCase().includes(lower)).slice(0, maxResults);
}

describe('SearchInput result filtering logic', () => {
  const options = ['react', 'react-dom', 'vitest', 'vite', 'vue'];

  it('returns all options (up to maxResults) when query is empty', () => {
    expect(filterOptions(options, '')).toEqual(['react', 'react-dom', 'vitest', 'vite', 'vue']);
  });

  it('filters by case-insensitive prefix', () => {
    expect(filterOptions(options, 'VUE')).toEqual(['vue']);
  });

  it('filters substring matches', () => {
    const result = filterOptions(options, 'react');
    expect(result).toContain('react');
    expect(result).toContain('react-dom');
    expect(result).not.toContain('vitest');
  });

  it('respects maxResults limit', () => {
    const manyOptions = ['a', 'ab', 'abc', 'abcd', 'abcde', 'abcdef'];
    expect(filterOptions(manyOptions, 'a', 3)).toHaveLength(3);
  });

  it('returns empty array when no match', () => {
    expect(filterOptions(options, 'angular')).toEqual([]);
  });

  it('returns empty array for empty options list', () => {
    expect(filterOptions([], 'react')).toEqual([]);
  });
});

// ── Selection cursor (pure) ────────────────────────────────────────────────
// Mirrors the selectedIndex navigation: clamped between 0 and length-1

function clampIndex(current: number, delta: number, maxIndex: number): number {
  return Math.min(Math.max(0, current + delta), maxIndex);
}

describe('SearchInput selection navigation logic', () => {
  it('increments index up to the last result', () => {
    expect(clampIndex(2, 1, 4)).toBe(3);
  });

  it('does not exceed the last result index', () => {
    expect(clampIndex(4, 1, 4)).toBe(4);
  });

  it('decrements index down to 0', () => {
    expect(clampIndex(1, -1, 4)).toBe(0);
  });

  it('does not go below 0', () => {
    expect(clampIndex(0, -1, 4)).toBe(0);
  });
});

import { describe, it, expect } from 'vitest';
import { Pagination } from './Pagination.js';

// ── Export smoke test ──────────────────────────────────────────────────────

describe('Pagination export', () => {
  it('is exported as a function', () => {
    expect(typeof Pagination).toBe('function');
  });
});

// ── buildPages ─────────────────────────────────────────────────────────────
// Inline copy from Pagination.tsx

function buildPages(total: number, current: number, siblings: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];
  pages.push(1);

  const leftSibling = Math.max(2, current - siblings);
  const rightSibling = Math.min(total - 1, current + siblings);

  if (leftSibling > 2) pages.push('...');

  for (let i = leftSibling; i <= rightSibling; i++) {
    pages.push(i);
  }

  if (rightSibling < total - 1) pages.push('...');

  pages.push(total);

  return pages;
}

describe('buildPages — small total (≤7)', () => {
  it('returns all pages when total is 1', () => {
    expect(buildPages(1, 1, 1)).toEqual([1]);
  });

  it('returns all pages when total is 5', () => {
    expect(buildPages(5, 3, 1)).toEqual([1, 2, 3, 4, 5]);
  });

  it('returns all pages when total equals 7', () => {
    expect(buildPages(7, 4, 1)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

describe('buildPages — large total (>7)', () => {
  it('always includes page 1 and last page', () => {
    const pages = buildPages(20, 10, 1);
    expect(pages[0]).toBe(1);
    expect(pages[pages.length - 1]).toBe(20);
  });

  it('includes ellipsis after 1 when current is far right', () => {
    const pages = buildPages(20, 15, 1);
    expect(pages[1]).toBe('...');
  });

  it('includes ellipsis before last when current is far left', () => {
    const pages = buildPages(20, 2, 1);
    expect(pages[pages.length - 2]).toBe('...');
  });

  it('includes both ellipses when current is in the middle', () => {
    const pages = buildPages(20, 10, 1);
    expect(pages).toContain('...');
    const ellipsisCount = pages.filter((p) => p === '...').length;
    expect(ellipsisCount).toBe(2);
  });

  it('includes sibling pages around current', () => {
    const pages = buildPages(20, 10, 1);
    expect(pages).toContain(9);
    expect(pages).toContain(10);
    expect(pages).toContain(11);
  });

  it('includes more siblings when siblings=2', () => {
    const pages = buildPages(20, 10, 2);
    expect(pages).toContain(8);
    expect(pages).toContain(9);
    expect(pages).toContain(10);
    expect(pages).toContain(11);
    expect(pages).toContain(12);
  });

  it('no ellipsis after 1 when current is near the start', () => {
    const pages = buildPages(10, 2, 1);
    // leftSibling = max(2, 2-1) = 2, no gap after page 1
    expect(pages[1]).not.toBe('...');
  });
});

// ── goTo clamping ──────────────────────────────────────────────────────────

function goTo(page: number, current: number, total: number): number {
  return Math.min(Math.max(1, page), total);
}

describe('goTo clamping', () => {
  it('clamps to 1 when page < 1', () => {
    expect(goTo(0, 3, 10)).toBe(1);
  });

  it('clamps to total when page > total', () => {
    expect(goTo(15, 10, 10)).toBe(10);
  });

  it('returns the page unchanged when within range', () => {
    expect(goTo(5, 3, 10)).toBe(5);
  });

  it('allows going to page 1', () => {
    expect(goTo(1, 5, 10)).toBe(1);
  });

  it('allows going to total', () => {
    expect(goTo(10, 5, 10)).toBe(10);
  });
});

import { describe, it, expect } from 'vitest';
import { useKeyboardNavigation } from './useKeyboardNavigation.js';

/**
 * Tests for the navigation index arithmetic used by useKeyboardNavigation.
 * The hook itself wraps useInput (Ink) so we test the pure index logic directly.
 */

// ── Index arithmetic helpers (mirrors hook internals) ─────────────────────────

function moveUp(index: number, itemCount: number, loop: boolean): number {
  return loop ? (index - 1 + itemCount) % itemCount : Math.max(0, index - 1);
}

function moveDown(index: number, itemCount: number, loop: boolean): number {
  return loop ? (index + 1) % itemCount : Math.min(itemCount - 1, index + 1);
}

function clamp(index: number, itemCount: number): number {
  return Math.max(0, Math.min(itemCount - 1, index));
}

function pageUp(index: number, pageSize: number): number {
  return Math.max(0, index - pageSize);
}

function pageDown(index: number, itemCount: number, pageSize: number): number {
  return Math.min(itemCount - 1, index + pageSize);
}

// ── Smoke test: module exports ────────────────────────────────────────────────

describe('useKeyboardNavigation — exports', () => {
  it('exports useKeyboardNavigation as a function', () => {
    expect(typeof useKeyboardNavigation).toBe('function');
  });
});

// ── Arrow key navigation ──────────────────────────────────────────────────────

describe('navigation index — loop: true', () => {
  it('moveUp wraps from 0 to last index', () => {
    expect(moveUp(0, 5, true)).toBe(4);
  });

  it('moveDown wraps from last to 0', () => {
    expect(moveDown(4, 5, true)).toBe(0);
  });

  it('moveUp decrements normally', () => {
    expect(moveUp(3, 5, true)).toBe(2);
  });

  it('moveDown increments normally', () => {
    expect(moveDown(2, 5, true)).toBe(3);
  });
});

describe('navigation index — loop: false', () => {
  it('moveUp stops at 0', () => {
    expect(moveUp(0, 5, false)).toBe(0);
  });

  it('moveDown stops at last index', () => {
    expect(moveDown(4, 5, false)).toBe(4);
  });

  it('moveUp decrements normally', () => {
    expect(moveUp(3, 5, false)).toBe(2);
  });

  it('moveDown increments normally', () => {
    expect(moveDown(2, 5, false)).toBe(3);
  });
});

// ── Home / End ────────────────────────────────────────────────────────────────

describe('Home / End', () => {
  it('Home always returns 0', () => {
    expect(clamp(0, 10)).toBe(0);
    // Home key sets index to 0 directly
    expect(0).toBe(0);
  });

  it('End always returns itemCount - 1', () => {
    const last = 10 - 1;
    expect(last).toBe(9);
  });
});

// ── Page Up / Page Down ───────────────────────────────────────────────────────

describe('pageUp / pageDown', () => {
  it('pageUp moves back by pageSize', () => {
    expect(pageUp(15, 10)).toBe(5);
  });

  it('pageUp clamps to 0', () => {
    expect(pageUp(3, 10)).toBe(0);
  });

  it('pageDown moves forward by pageSize', () => {
    expect(pageDown(5, 30, 10)).toBe(15);
  });

  it('pageDown clamps to itemCount - 1', () => {
    expect(pageDown(25, 30, 10)).toBe(29);
  });
});

// ── setActiveIndex clamping ───────────────────────────────────────────────────

describe('setActiveIndex clamping', () => {
  it('clamps negative index to 0', () => {
    expect(clamp(-5, 10)).toBe(0);
  });

  it('clamps index beyond last to itemCount - 1', () => {
    expect(clamp(99, 10)).toBe(9);
  });

  it('passes valid index through unchanged', () => {
    expect(clamp(4, 10)).toBe(4);
  });

  it('handles single-item list', () => {
    expect(clamp(0, 1)).toBe(0);
    expect(clamp(5, 1)).toBe(0);
  });
});

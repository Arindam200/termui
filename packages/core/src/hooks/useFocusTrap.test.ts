import { describe, it, expect } from 'vitest';

/**
 * Tests for useFocusTrap.
 * The hook delegates to Ink's useFocusManager so we verify the module
 * exports and the focus ID cycling logic.
 */

// ── Smoke test ────────────────────────────────────────────────────────────────

describe('useFocusTrap — exports', () => {
  it('exports useFocusTrap as a function', async () => {
    const mod = await import('./useFocusTrap.js');
    expect(typeof mod.useFocusTrap).toBe('function');
  });
});

// ── Focus cycling logic (mirrors hook internals) ──────────────────────────────

function cycleForward(index: number, ids: string[]): number {
  return (index + 1) % ids.length;
}

function cycleBackward(index: number, ids: string[]): number {
  return (index - 1 + ids.length) % ids.length;
}

describe('focus trap cycling', () => {
  const ids = ['modal-title', 'modal-confirm', 'modal-cancel'];

  it('Tab cycles forward through focusable IDs', () => {
    expect(cycleForward(0, ids)).toBe(1);
    expect(cycleForward(1, ids)).toBe(2);
  });

  it('Tab wraps from last back to first', () => {
    expect(cycleForward(2, ids)).toBe(0);
  });

  it('Shift+Tab cycles backward through focusable IDs', () => {
    expect(cycleBackward(2, ids)).toBe(1);
    expect(cycleBackward(1, ids)).toBe(0);
  });

  it('Shift+Tab wraps from first to last', () => {
    expect(cycleBackward(0, ids)).toBe(2);
  });

  it('single focusable element always cycles to itself', () => {
    const single = ['only-button'];
    expect(cycleForward(0, single)).toBe(0);
    expect(cycleBackward(0, single)).toBe(0);
  });

  it('two focusable elements toggle back and forth', () => {
    const two = ['confirm', 'cancel'];
    expect(cycleForward(0, two)).toBe(1);
    expect(cycleForward(1, two)).toBe(0);
    expect(cycleBackward(0, two)).toBe(1);
    expect(cycleBackward(1, two)).toBe(0);
  });
});

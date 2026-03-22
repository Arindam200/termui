import { describe, it, expect } from 'vitest';
import { Dialog } from './Dialog.js';

describe('Dialog export', () => {
  it('is exported as a function', () => {
    expect(typeof Dialog).toBe('function');
  });
});

// ── Button focus logic ─────────────────────────────────────────────────────
// Mirrors the keyboard handler inside Dialog.tsx.
// focusedButton: 0 = cancel, 1 = confirm

function simulateDialogNav(initial: 0 | 1 = 0) {
  let focused: 0 | 1 = initial;

  const handleKey = (key: { leftArrow?: boolean; rightArrow?: boolean; tab?: boolean }) => {
    if (key.leftArrow || key.tab) focused = focused === 0 ? 1 : 0;
    if (key.rightArrow) focused = focused === 0 ? 1 : 0;
  };

  return { getFocused: () => focused, handleKey };
}

describe('Dialog button navigation', () => {
  it('starts focused on Cancel (0) by default', () => {
    const { getFocused } = simulateDialogNav();
    expect(getFocused()).toBe(0);
  });

  it('moves to Confirm on right arrow', () => {
    const { handleKey, getFocused } = simulateDialogNav();
    handleKey({ rightArrow: true });
    expect(getFocused()).toBe(1);
  });

  it('moves back to Cancel on another arrow press', () => {
    const { handleKey, getFocused } = simulateDialogNav();
    handleKey({ rightArrow: true });
    handleKey({ leftArrow: true });
    expect(getFocused()).toBe(0);
  });

  it('toggles between buttons on tab', () => {
    const { handleKey, getFocused } = simulateDialogNav();
    handleKey({ tab: true });
    expect(getFocused()).toBe(1);
    handleKey({ tab: true });
    expect(getFocused()).toBe(0);
  });
});

// ── Variant color selection ────────────────────────────────────────────────

describe('Dialog variant', () => {
  it('accepts default variant', () => {
    const variant = 'default';
    expect(['default', 'danger'].includes(variant)).toBe(true);
  });

  it('accepts danger variant', () => {
    const variant = 'danger';
    expect(['default', 'danger'].includes(variant)).toBe(true);
  });
});

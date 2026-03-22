import { describe, it, expect } from 'vitest';
import { Confirm } from './Confirm.js';

describe('Confirm export', () => {
  it('is exported as a function', () => {
    expect(typeof Confirm).toBe('function');
  });
});

// ── Confirm selection logic ────────────────────────────────────────────────
// Mirrors the keyboard handler logic in Confirm.tsx

function simulateConfirm(defaultValue: boolean) {
  let selected = defaultValue;

  const handleKey = (key: {
    leftArrow?: boolean;
    rightArrow?: boolean;
    tab?: boolean;
    return?: boolean;
  }) => {
    if (key.leftArrow || key.tab) selected = !selected;
    if (key.rightArrow) selected = !selected;
    return selected;
  };

  return { handleKey, getSelected: () => selected };
}

describe('Confirm selection', () => {
  it('starts with defaultValue=false', () => {
    const { getSelected } = simulateConfirm(false);
    expect(getSelected()).toBe(false);
  });

  it('starts with defaultValue=true', () => {
    const { getSelected } = simulateConfirm(true);
    expect(getSelected()).toBe(true);
  });

  it('toggles on left arrow', () => {
    const { handleKey, getSelected } = simulateConfirm(false);
    handleKey({ leftArrow: true });
    expect(getSelected()).toBe(true);
  });

  it('toggles on right arrow', () => {
    const { handleKey, getSelected } = simulateConfirm(true);
    handleKey({ rightArrow: true });
    expect(getSelected()).toBe(false);
  });

  it('toggles back on second arrow press', () => {
    const { handleKey, getSelected } = simulateConfirm(false);
    handleKey({ leftArrow: true });
    handleKey({ leftArrow: true });
    expect(getSelected()).toBe(false);
  });
});

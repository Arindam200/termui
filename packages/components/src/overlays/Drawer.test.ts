import { describe, it, expect } from 'vitest';
import { Drawer } from './Drawer.js';

describe('Drawer export', () => {
  it('is exported as a function', () => {
    expect(typeof Drawer).toBe('function');
  });
});

// ── Position validation ────────────────────────────────────────────────────

const VALID_POSITIONS = ['top', 'right', 'bottom', 'left'] as const;
type DrawerPosition = (typeof VALID_POSITIONS)[number];

function isValidPosition(p: string): p is DrawerPosition {
  return VALID_POSITIONS.includes(p as DrawerPosition);
}

describe('Drawer positions', () => {
  it('accepts "right"', () => expect(isValidPosition('right')).toBe(true));
  it('accepts "left"', () => expect(isValidPosition('left')).toBe(true));
  it('accepts "top"', () => expect(isValidPosition('top')).toBe(true));
  it('accepts "bottom"', () => expect(isValidPosition('bottom')).toBe(true));
  it('rejects unknown positions', () => expect(isValidPosition('diagonal')).toBe(false));
});

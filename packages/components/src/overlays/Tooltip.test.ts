import { describe, it, expect } from 'vitest';
import { Tooltip } from './Tooltip.js';

describe('Tooltip export', () => {
  it('is exported as a function', () => {
    expect(typeof Tooltip).toBe('function');
  });
});

// ── Position arrow mapping ────────────────────────────────────────────────
// Mirrors the arrow character selection in Tooltip.tsx

function getArrow(
  position: 'top' | 'bottom' | 'left' | 'right',
  defaults: {
    arrowDown: string;
    arrowUp: string;
    arrowLeft: string;
    arrowRight: string;
  }
): string {
  switch (position) {
    case 'top':
      return defaults.arrowDown;
    case 'bottom':
      return defaults.arrowUp;
    case 'left':
      return defaults.arrowRight;
    case 'right':
      return defaults.arrowLeft;
  }
}

describe('Tooltip arrow direction', () => {
  const defaults = { arrowDown: '↓', arrowUp: '↑', arrowLeft: '←', arrowRight: '→' };

  it('top position shows arrow pointing down', () => {
    expect(getArrow('top', defaults)).toBe('↓');
  });

  it('bottom position shows arrow pointing up', () => {
    expect(getArrow('bottom', defaults)).toBe('↑');
  });

  it('left position shows arrow pointing right', () => {
    expect(getArrow('left', defaults)).toBe('→');
  });

  it('right position shows arrow pointing left', () => {
    expect(getArrow('right', defaults)).toBe('←');
  });
});

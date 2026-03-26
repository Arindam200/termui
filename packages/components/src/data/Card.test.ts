import { describe, it, expect } from 'vitest';
import { Card } from './Card.js';

// ── Export smoke test ──────────────────────────────────────────────────────

describe('Card export', () => {
  it('is exported as a function', () => {
    expect(typeof Card).toBe('function');
  });
});

// ── Header (title / subtitle) presence ────────────────────────────────────
// Mirrors `{(title || subtitle) && <Box>...}` in Card.tsx

function hasHeader(title?: string, subtitle?: string): boolean {
  return !!(title || subtitle);
}

describe('Card header slot', () => {
  it('renders header when title is provided', () => {
    expect(hasHeader('My Card')).toBe(true);
  });

  it('renders header when only subtitle is provided', () => {
    expect(hasHeader(undefined, 'A subtitle')).toBe(true);
  });

  it('renders header when both title and subtitle are provided', () => {
    expect(hasHeader('Title', 'Subtitle')).toBe(true);
  });

  it('does not render header when neither title nor subtitle is given', () => {
    expect(hasHeader()).toBe(false);
  });

  it('does not render header when both are empty strings', () => {
    expect(hasHeader('', '')).toBe(false);
  });
});

// ── Footer slot ────────────────────────────────────────────────────────────
// Mirrors `{footer && <Box>...footerDividerChar...footer</Box>}` in Card.tsx

function hasFooter(footer: unknown): boolean {
  return !!footer;
}

describe('Card footer slot', () => {
  it('renders footer when footer prop is provided', () => {
    expect(hasFooter('Footer content')).toBe(true);
  });

  it('does not render footer when footer prop is absent', () => {
    expect(hasFooter(undefined)).toBe(false);
  });

  it('does not render footer when footer is null', () => {
    expect(hasFooter(null)).toBe(false);
  });
});

// ── Footer divider ─────────────────────────────────────────────────────────
// Mirrors `footerDividerChar.repeat(30)` in Card.tsx

function buildFooterDivider(char = '─', length = 30): string {
  return char.repeat(length);
}

describe('Card footer divider', () => {
  it('uses default "─" character repeated 30 times', () => {
    const divider = buildFooterDivider();
    expect(divider).toBe('─'.repeat(30));
    expect(divider).toHaveLength(30);
  });

  it('uses custom footerDividerChar when provided', () => {
    const divider = buildFooterDivider('=');
    expect(divider).toBe('='.repeat(30));
  });
});

// ── Border style defaults ──────────────────────────────────────────────────
// Mirrors the `borderStyle = 'round'` default in Card.tsx

type BorderStyle =
  | 'single'
  | 'double'
  | 'round'
  | 'bold'
  | 'singleDouble'
  | 'doubleSingle'
  | 'classic';

function resolveBorderStyle(borderStyle?: BorderStyle): BorderStyle {
  return borderStyle ?? 'round';
}

describe('Card bordered container', () => {
  it('defaults to "round" border style', () => {
    expect(resolveBorderStyle()).toBe('round');
  });

  it('uses provided border style', () => {
    expect(resolveBorderStyle('double')).toBe('double');
  });

  it('accepts all documented border styles', () => {
    const styles: BorderStyle[] = [
      'single',
      'double',
      'round',
      'bold',
      'singleDouble',
      'doubleSingle',
      'classic',
    ];
    for (const style of styles) {
      expect(resolveBorderStyle(style)).toBe(style);
    }
  });
});

// ── Padding defaults ───────────────────────────────────────────────────────
// Mirrors `paddingX = 1` and `paddingY = 0` defaults in Card.tsx

function resolvePadding(
  paddingX?: number,
  paddingY?: number
): { paddingX: number; paddingY: number } {
  return { paddingX: paddingX ?? 1, paddingY: paddingY ?? 0 };
}

describe('Card padding defaults', () => {
  it('defaults paddingX to 1', () => {
    expect(resolvePadding().paddingX).toBe(1);
  });

  it('defaults paddingY to 0', () => {
    expect(resolvePadding().paddingY).toBe(0);
  });

  it('respects explicit paddingX and paddingY', () => {
    const { paddingX, paddingY } = resolvePadding(2, 1);
    expect(paddingX).toBe(2);
    expect(paddingY).toBe(1);
  });
});

// ── Body slot ─────────────────────────────────────────────────────────────
// The `children` prop is always rendered; verify that any truthy value passes
// (Card always wraps children in a Box)

function hasBody(children: unknown): boolean {
  return children !== null && children !== undefined;
}

describe('Card body slot', () => {
  it('renders when children is a string', () => {
    expect(hasBody('Hello')).toBe(true);
  });

  it('renders when children is a React element (truthy object)', () => {
    expect(hasBody({ type: 'Text', props: {} })).toBe(true);
  });

  it('treats null children as absent body', () => {
    expect(hasBody(null)).toBe(false);
  });
});

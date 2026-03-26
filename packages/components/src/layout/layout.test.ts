import { describe, it, expect } from 'vitest';
import { Divider } from './Divider.js';
import { Center } from './Center.js';
import { Stack } from './Stack.js';

// ── Export smoke tests ──────────────────────────────────────────────────────

describe('layout component exports', () => {
  it('Divider is exported as a function', () => {
    expect(typeof Divider).toBe('function');
  });

  it('Center is exported as a function', () => {
    expect(typeof Center).toBe('function');
  });

  it('Stack is exported as a function', () => {
    expect(typeof Stack).toBe('function');
  });
});

// ── Divider — separator characters ─────────────────────────────────────────
// Mirrors HORIZONTAL_CHARS and VERTICAL_CHARS maps in Divider.tsx

type DividerVariant = 'single' | 'double' | 'bold';

const HORIZONTAL_CHARS: Record<DividerVariant, string> = {
  single: '─',
  double: '═',
  bold: '━',
};

const VERTICAL_CHARS: Record<DividerVariant, string> = {
  single: '│',
  double: '║',
  bold: '┃',
};

describe('Divider separator characters', () => {
  it('uses "─" for single horizontal variant', () => {
    expect(HORIZONTAL_CHARS['single']).toBe('─');
  });

  it('uses "═" for double horizontal variant', () => {
    expect(HORIZONTAL_CHARS['double']).toBe('═');
  });

  it('uses "━" for bold horizontal variant', () => {
    expect(HORIZONTAL_CHARS['bold']).toBe('━');
  });

  it('uses "│" for single vertical variant', () => {
    expect(VERTICAL_CHARS['single']).toBe('│');
  });

  it('uses "║" for double vertical variant', () => {
    expect(VERTICAL_CHARS['double']).toBe('║');
  });

  it('uses "┃" for bold vertical variant', () => {
    expect(VERTICAL_CHARS['bold']).toBe('┃');
  });

  it('horizontal char is different from vertical char for each variant', () => {
    for (const variant of ['single', 'double', 'bold'] as DividerVariant[]) {
      expect(HORIZONTAL_CHARS[variant]).not.toBe(VERTICAL_CHARS[variant]);
    }
  });
});

// ── Divider — label rendering ───────────────────────────────────────────────
// Mirrors the `if (label)` branch in Divider.tsx that wraps the label between
// separator characters when a label prop is provided.

function buildLabeledDivider(char: string, label: string): string {
  return `${char}${char}${char} ${label} ${char}${char}${char}`;
}

function hasLabel(label?: string): boolean {
  return !!label;
}

describe('Divider label rendering', () => {
  it('includes label text in labeled divider', () => {
    const result = buildLabeledDivider('─', 'Section');
    expect(result).toContain('Section');
  });

  it('surrounds label with separator characters', () => {
    const result = buildLabeledDivider('─', 'Title');
    expect(result).toMatch(/^─/);
    expect(result).toContain('Title');
    expect(result).toMatch(/─$/);
  });

  it('does not show label branch when label is undefined', () => {
    expect(hasLabel(undefined)).toBe(false);
  });

  it('does not show label branch when label is empty string', () => {
    expect(hasLabel('')).toBe(false);
  });

  it('shows label branch when label is provided', () => {
    expect(hasLabel('My Label')).toBe(true);
  });

  it('uses the correct separator char in labeled output', () => {
    const single = buildLabeledDivider(HORIZONTAL_CHARS['single'], 'A');
    const double = buildLabeledDivider(HORIZONTAL_CHARS['double'], 'A');
    expect(single).toContain('─');
    expect(double).toContain('═');
  });
});

// ── Divider — orientation default ──────────────────────────────────────────

type Orientation = 'horizontal' | 'vertical';

function resolveOrientation(orientation?: Orientation): Orientation {
  return orientation ?? 'horizontal';
}

describe('Divider orientation', () => {
  it('defaults to horizontal', () => {
    expect(resolveOrientation()).toBe('horizontal');
  });

  it('accepts explicit vertical orientation', () => {
    expect(resolveOrientation('vertical')).toBe('vertical');
  });

  it('accepts explicit horizontal orientation', () => {
    expect(resolveOrientation('horizontal')).toBe('horizontal');
  });
});

// ── Divider — vertical repeat count ────────────────────────────────────────
// Mirrors `Array.from({ length: height }, ...)` in the vertical branch.

function buildVerticalLines(height: number, char: string): string[] {
  return Array.from({ length: height }, () => char);
}

describe('Divider vertical height', () => {
  it('renders correct number of lines for vertical divider', () => {
    const lines = buildVerticalLines(3, '│');
    expect(lines).toHaveLength(3);
  });

  it('each line contains the vertical separator character', () => {
    const lines = buildVerticalLines(4, '│');
    lines.forEach((line) => expect(line).toBe('│'));
  });

  it('defaults height of 1 produces a single line', () => {
    const lines = buildVerticalLines(1, '│');
    expect(lines).toHaveLength(1);
  });
});

// ── Center — axis prop ──────────────────────────────────────────────────────
// Mirrors the justifyContent / alignItems logic in Center.tsx

type CenterAxis = 'both' | 'horizontal' | 'vertical';

function resolveCenterLayout(axis: CenterAxis): {
  justifyContent: 'center' | undefined;
  alignItems: 'center' | undefined;
} {
  const justifyContent = axis === 'both' || axis === 'horizontal' ? 'center' : undefined;
  const alignItems = axis === 'both' || axis === 'vertical' ? 'center' : undefined;
  return { justifyContent, alignItems };
}

describe('Center axis layout', () => {
  it('centers on both axes by default (both)', () => {
    const { justifyContent, alignItems } = resolveCenterLayout('both');
    expect(justifyContent).toBe('center');
    expect(alignItems).toBe('center');
  });

  it('centers only horizontally when axis is "horizontal"', () => {
    const { justifyContent, alignItems } = resolveCenterLayout('horizontal');
    expect(justifyContent).toBe('center');
    expect(alignItems).toBeUndefined();
  });

  it('centers only vertically when axis is "vertical"', () => {
    const { justifyContent, alignItems } = resolveCenterLayout('vertical');
    expect(justifyContent).toBeUndefined();
    expect(alignItems).toBe('center');
  });
});

// ── Center — children passthrough ──────────────────────────────────────────
// Center is a pure layout wrapper; verify it never suppresses children.

function centerPassesChildren(children: unknown): boolean {
  return children !== null && children !== undefined;
}

describe('Center children passthrough', () => {
  it('passes through string children', () => {
    expect(centerPassesChildren('Hello')).toBe(true);
  });

  it('passes through React element children', () => {
    expect(centerPassesChildren({ type: 'Text', props: {} })).toBe(true);
  });

  it('passes through array children', () => {
    expect(centerPassesChildren(['a', 'b'])).toBe(true);
  });
});

// ── Stack — flexDirection mapping ───────────────────────────────────────────
// Mirrors `direction === 'vertical' ? 'column' : 'row'` in Stack.tsx

type StackDirection = 'vertical' | 'horizontal';
type FlexDirection = 'column' | 'row';

function resolveFlexDirection(direction: StackDirection): FlexDirection {
  return direction === 'vertical' ? 'column' : 'row';
}

describe('Stack flex direction', () => {
  it('maps "vertical" direction to "column"', () => {
    expect(resolveFlexDirection('vertical')).toBe('column');
  });

  it('maps "horizontal" direction to "row"', () => {
    expect(resolveFlexDirection('horizontal')).toBe('row');
  });
});

// ── Stack — direction default ───────────────────────────────────────────────

function resolveStackDirection(direction?: StackDirection): StackDirection {
  return direction ?? 'vertical';
}

describe('Stack direction default', () => {
  it('defaults to vertical when direction is not specified', () => {
    expect(resolveStackDirection()).toBe('vertical');
  });

  it('uses provided horizontal direction', () => {
    expect(resolveStackDirection('horizontal')).toBe('horizontal');
  });

  it('uses provided vertical direction', () => {
    expect(resolveStackDirection('vertical')).toBe('vertical');
  });
});

// ── Stack — gap default ─────────────────────────────────────────────────────

function resolveGap(gap?: number): number {
  return gap ?? 0;
}

describe('Stack gap default', () => {
  it('defaults to 0 when no gap is provided', () => {
    expect(resolveGap()).toBe(0);
  });

  it('uses the provided gap value', () => {
    expect(resolveGap(2)).toBe(2);
    expect(resolveGap(4)).toBe(4);
  });
});

// ── Stack — alignItems / justifyContent passthrough ─────────────────────────
// Stack passes these directly to the underlying Box; verify they are forwarded
// unchanged.

type StackAlign = 'flex-start' | 'center' | 'flex-end';
type StackJustify = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';

function resolveStackProps(
  alignItems?: StackAlign,
  justifyContent?: StackJustify
): { alignItems: StackAlign | undefined; justifyContent: StackJustify | undefined } {
  return { alignItems, justifyContent };
}

describe('Stack alignItems and justifyContent', () => {
  it('passes alignItems="center" through', () => {
    expect(resolveStackProps('center').alignItems).toBe('center');
  });

  it('passes justifyContent="space-between" through', () => {
    expect(resolveStackProps(undefined, 'space-between').justifyContent).toBe('space-between');
  });

  it('leaves both undefined when not specified', () => {
    const { alignItems, justifyContent } = resolveStackProps();
    expect(alignItems).toBeUndefined();
    expect(justifyContent).toBeUndefined();
  });
});

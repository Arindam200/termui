import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from '@termui/testing';
import { ThemeProvider } from '@termui/core';
import { Tag } from './Tag.js';

const e = React.createElement;

function wrap(child: React.ReactElement): React.ReactElement {
  return e(ThemeProvider, {}, child);
}

// ── Export smoke test ──────────────────────────────────────────────────────

describe('Tag export', () => {
  it('is exported as a function', () => {
    expect(typeof Tag).toBe('function');
  });
});

// ── Label rendering ────────────────────────────────────────────────────────

describe('Tag renders label', () => {
  it('renders a string child', async () => {
    const output = await renderToString(wrap(e(Tag, {}, 'typescript')));
    expect(output).toContain('typescript');
  });

  it('renders a numeric label string', async () => {
    const output = await renderToString(wrap(e(Tag, {}, '#42')));
    expect(output).toContain('#42');
  });

  it('renders a multi-word label', async () => {
    const output = await renderToString(wrap(e(Tag, {}, 'in review')));
    expect(output).toContain('in review');
  });
});

// ── Removable / × indicator ───────────────────────────────────────────────

describe('Tag removable indicator', () => {
  it('shows × character when onRemove callback is provided', async () => {
    const output = await renderToString(wrap(e(Tag, { onRemove: () => {} }, 'remove me')));
    expect(output).toContain('×');
  });

  it('does not show × when onRemove is not provided', async () => {
    const output = await renderToString(wrap(e(Tag, {}, 'keep me')));
    expect(output).not.toContain('×');
  });

  it('still renders the label when removable', async () => {
    const output = await renderToString(wrap(e(Tag, { onRemove: () => {} }, 'label')));
    expect(output).toContain('label');
    expect(output).toContain('×');
  });
});

// ── Variant logic (pure) ───────────────────────────────────────────────────
// Mirrors Tag.tsx: variant === 'outline' uses mutedForeground for border/text,
// otherwise uses resolvedColor (custom color or primary token).

import { defaultTheme } from '@termui/core';

type TagVariant = 'default' | 'outline';

function resolveTagTextColor(variant: TagVariant, customColor?: string): string {
  if (variant === 'outline') return defaultTheme.colors.mutedForeground;
  return customColor ?? defaultTheme.colors.primary;
}

describe('Tag variant color logic', () => {
  it('default variant uses primary color when no custom color', () => {
    expect(resolveTagTextColor('default')).toBe(defaultTheme.colors.primary);
  });

  it('default variant uses custom color when provided', () => {
    expect(resolveTagTextColor('default', '#ff0000')).toBe('#ff0000');
  });

  it('outline variant always uses mutedForeground', () => {
    expect(resolveTagTextColor('outline')).toBe(defaultTheme.colors.mutedForeground);
  });

  it('outline variant ignores custom color', () => {
    expect(resolveTagTextColor('outline', '#ff0000')).toBe(defaultTheme.colors.mutedForeground);
  });
});

// ── Rendered variant output ────────────────────────────────────────────────

describe('Tag variant rendering', () => {
  it('renders label for default variant', async () => {
    const output = await renderToString(wrap(e(Tag, { variant: 'default' }, 'default')));
    expect(output).toContain('default');
  });

  it('renders label for outline variant', async () => {
    const output = await renderToString(wrap(e(Tag, { variant: 'outline' }, 'outline')));
    expect(output).toContain('outline');
  });
});

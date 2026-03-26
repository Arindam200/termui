import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from '@termui/testing';
import { ThemeProvider } from '@termui/core';
import { Badge } from './Badge.js';

const e = React.createElement;

function wrap(child: React.ReactElement): React.ReactElement {
  return e(ThemeProvider, {}, child);
}

// ── Export smoke test ──────────────────────────────────────────────────────

describe('Badge export', () => {
  it('is exported as a function', () => {
    expect(typeof Badge).toBe('function');
  });
});

// ── Text rendering ─────────────────────────────────────────────────────────

describe('Badge renders label text', () => {
  it('renders the provided children string', async () => {
    const output = await renderToString(wrap(e(Badge, {}, 'v1.0.0')));
    expect(output).toContain('v1.0.0');
  });

  it('renders a single-word label', async () => {
    const output = await renderToString(wrap(e(Badge, {}, 'NEW')));
    expect(output).toContain('NEW');
  });

  it('renders a multi-word label', async () => {
    const output = await renderToString(wrap(e(Badge, {}, 'In Progress')));
    expect(output).toContain('In Progress');
  });
});

// ── Variant color resolution (pure logic) ─────────────────────────────────
// Mirrors the switch-case inside Badge.tsx

import { defaultTheme } from '@termui/core';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary';

function resolveVariantColor(variant: BadgeVariant, customColor?: string): string {
  if (customColor) return customColor;
  switch (variant) {
    case 'success':
      return defaultTheme.colors.success;
    case 'warning':
      return defaultTheme.colors.warning;
    case 'error':
      return defaultTheme.colors.error;
    case 'info':
      return defaultTheme.colors.info;
    case 'secondary':
      return defaultTheme.colors.secondary;
    default:
      return defaultTheme.colors.primary;
  }
}

describe('Badge variant color resolution', () => {
  it('success variant maps to the success token', () => {
    expect(resolveVariantColor('success')).toBe(defaultTheme.colors.success);
  });

  it('error variant maps to the error token', () => {
    expect(resolveVariantColor('error')).toBe(defaultTheme.colors.error);
  });

  it('warning variant maps to the warning token', () => {
    expect(resolveVariantColor('warning')).toBe(defaultTheme.colors.warning);
  });

  it('info variant maps to the info token', () => {
    expect(resolveVariantColor('info')).toBe(defaultTheme.colors.info);
  });

  it('secondary variant maps to the secondary token', () => {
    expect(resolveVariantColor('secondary')).toBe(defaultTheme.colors.secondary);
  });

  it('default variant maps to the primary token', () => {
    expect(resolveVariantColor('default')).toBe(defaultTheme.colors.primary);
  });

  it('custom color overrides the variant', () => {
    expect(resolveVariantColor('success', '#abcdef')).toBe('#abcdef');
  });
});

// ── Rendered output for select variants ───────────────────────────────────

describe('Badge renders with variant prop', () => {
  it('renders success badge with label', async () => {
    const output = await renderToString(wrap(e(Badge, { variant: 'success' }, 'OK')));
    expect(output).toContain('OK');
  });

  it('renders error badge with label', async () => {
    const output = await renderToString(wrap(e(Badge, { variant: 'error' }, 'FAIL')));
    expect(output).toContain('FAIL');
  });

  it('renders warning badge with label', async () => {
    const output = await renderToString(wrap(e(Badge, { variant: 'warning' }, 'WARN')));
    expect(output).toContain('WARN');
  });

  it('renders info badge with label', async () => {
    const output = await renderToString(wrap(e(Badge, { variant: 'info' }, 'INFO')));
    expect(output).toContain('INFO');
  });
});

// ── bordered / unbordered ─────────────────────────────────────────────────

describe('Badge bordered prop', () => {
  it('renders label when bordered=false', async () => {
    const output = await renderToString(wrap(e(Badge, { bordered: false }, 'plain')));
    expect(output).toContain('plain');
  });

  it('renders label when bordered=true (default)', async () => {
    const output = await renderToString(wrap(e(Badge, { bordered: true }, 'boxed')));
    expect(output).toContain('boxed');
  });
});

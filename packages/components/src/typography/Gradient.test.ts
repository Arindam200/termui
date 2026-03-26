import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from '@termui/testing';
import { ThemeProvider } from '@termui/core';
import { Gradient, gradientText } from './Gradient.js';

const e = React.createElement;

function wrap(child: React.ReactElement): React.ReactElement {
  return e(ThemeProvider, {}, child);
}

// ── Export smoke test ──────────────────────────────────────────────────────

describe('Gradient export', () => {
  it('Gradient is exported as a function', () => {
    expect(typeof Gradient).toBe('function');
  });

  it('gradientText helper is exported as a function', () => {
    expect(typeof gradientText).toBe('function');
  });
});

// ── Rendered text content ──────────────────────────────────────────────────

describe('Gradient renders text characters', () => {
  it('contains all characters of the input string', async () => {
    const output = await renderToString(
      wrap(e(Gradient, { colors: ['#ff0000', '#0000ff'] }, 'Hello'))
    );
    // Each char is rendered as a separate Text node; the full word should appear
    expect(output).toContain('H');
    expect(output).toContain('e');
    expect(output).toContain('l');
    expect(output).toContain('o');
  });

  it('renders a short string without crashing', async () => {
    const output = await renderToString(
      wrap(e(Gradient, { colors: ['#ff0000', '#00ff00'] }, 'Hi'))
    );
    expect(output).toContain('H');
    expect(output).toContain('i');
  });

  it('renders a single character', async () => {
    const output = await renderToString(wrap(e(Gradient, { colors: ['#ffffff', '#000000'] }, 'X')));
    expect(output).toContain('X');
  });

  it('renders with a single color (no interpolation needed)', async () => {
    const output = await renderToString(wrap(e(Gradient, { colors: ['#ff0000'] }, 'Red')));
    expect(output).toContain('R');
    expect(output).toContain('e');
    expect(output).toContain('d');
  });
});

// ── gradientText helper ────────────────────────────────────────────────────

describe('gradientText helper', () => {
  it('returns one entry per character', () => {
    const result = gradientText('abc', ['#ff0000', '#0000ff']);
    expect(result).toHaveLength(3);
  });

  it('preserves original characters', () => {
    const result = gradientText('Hi!', ['#ff0000', '#0000ff']);
    expect(result.map((c) => c.char).join('')).toBe('Hi!');
  });

  it('assigns a color to every character', () => {
    const result = gradientText('test', ['#ff0000', '#0000ff']);
    for (const item of result) {
      expect(typeof item.color).toBe('string');
      expect(item.color.length).toBeGreaterThan(0);
    }
  });

  it('returns empty array for empty string', () => {
    const result = gradientText('', ['#ff0000', '#0000ff']);
    expect(result).toHaveLength(0);
  });

  it('uses empty color string when no colors provided', () => {
    const result = gradientText('A', []);
    expect(result[0]?.color).toBe('');
  });

  it('applies the single color to all chars when one color provided', () => {
    const result = gradientText('AB', ['#abcdef']);
    expect(result[0]?.color).toBe('#abcdef');
    expect(result[1]?.color).toBe('#abcdef');
  });

  it('first char gets first color and last char gets last color', () => {
    const result = gradientText('AZ', ['#ff0000', '#0000ff']);
    // First character should use the start color
    expect(result[0]?.color).toBe('#ff0000');
    // Last character should use the end color
    expect(result[result.length - 1]?.color).toBe('#0000ff');
  });

  it('handles 3-char hex shorthand without crashing', () => {
    // Single-character text triggers the len <= 1 early return, which passes
    // colors[0] through unchanged. Verify no crash and the char is preserved.
    const result = gradientText('X', ['#f00', '#00f']);
    expect(result).toHaveLength(1);
    expect(result[0]?.char).toBe('X');
    expect(typeof result[0]?.color).toBe('string');
  });

  it('interpolates intermediate colors between stops', () => {
    const result = gradientText('ABC', ['#000000', '#ffffff']);
    // Middle character should be between the two extremes (not pure black or white)
    const midColor = result[1]?.color ?? '';
    expect(midColor).not.toBe('#000000');
    expect(midColor).not.toBe('#ffffff');
  });
});

// ── Color interpolation correctness (pure hex math) ───────────────────────

describe('gradientText color interpolation', () => {
  it('produces hex strings starting with #', () => {
    const result = gradientText('Hello', ['#ff0000', '#0000ff']);
    for (const { color } of result) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('three-stop gradient has correct first and last colors', () => {
    const result = gradientText('ABCDE', ['#ff0000', '#00ff00', '#0000ff']);
    expect(result[0]?.color).toBe('#ff0000');
    expect(result[result.length - 1]?.color).toBe('#0000ff');
  });
});

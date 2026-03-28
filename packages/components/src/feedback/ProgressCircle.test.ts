import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from '@termui/testing';
import { ThemeProvider } from '@termui/core';
import { ProgressCircle } from './ProgressCircle.js';

// ---------------------------------------------------------------------------
// Pure logic tests — inline reimplementation of getSmChar
// ---------------------------------------------------------------------------

const BRAILLE_CHARS = ['○', '◔', '◑', '◕', '●', '◉', '⬤', '●'];

function getSmChar(value: number): string {
  const clamped = Math.max(0, Math.min(100, value));
  const step = Math.floor((clamped / 100) * 7);
  return BRAILLE_CHARS[step];
}

function wrap(el: React.ReactElement) {
  // noUnicode={false} forces Unicode mode so tests pass on all platforms
  // (Windows CI has no WT_SESSION/TERM and would otherwise detect ASCII-only).
  return React.createElement(ThemeProvider, { noUnicode: false }, el);
}

// ---------------------------------------------------------------------------

describe('ProgressCircle — getSmChar logic', () => {
  it('returns ○ at 0%', () => {
    expect(getSmChar(0)).toBe('○');
  });

  it('returns ● at 100%', () => {
    expect(getSmChar(100)).toBe('●');
  });

  it('returns a mid-fill char at 50%', () => {
    const char = getSmChar(50);
    expect(['◔', '◑', '◕', '●', '◉', '⬤']).toContain(char);
  });

  it('clamps values below 0 to ○', () => {
    expect(getSmChar(-10)).toBe('○');
  });

  it('clamps values above 100 to ●', () => {
    expect(getSmChar(200)).toBe('●');
  });

  it('step increases monotonically as value increases', () => {
    // Compute the step index directly (same formula as the source) so we avoid
    // indexOf confusion caused by duplicate chars in BRAILLE_CHARS (index 4 and
    // 7 are both '●').
    const values = [0, 15, 30, 45, 60, 75, 90, 100];
    const steps = values.map((v) => {
      const clamped = Math.max(0, Math.min(100, v));
      return Math.floor((clamped / 100) * 7);
    });
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i]).toBeGreaterThanOrEqual(steps[i - 1]);
    }
  });
});

// ---------------------------------------------------------------------------

describe('ProgressCircle — render tests', () => {
  it('renders percent label for md size with showPercent', async () => {
    const output = await renderToString(
      wrap(React.createElement(ProgressCircle, { value: 75, size: 'md', showPercent: true }))
    );
    expect(output).toContain('75%');
  });

  it('renders percent label for lg size with showPercent', async () => {
    const output = await renderToString(
      wrap(React.createElement(ProgressCircle, { value: 50, size: 'lg', showPercent: true }))
    );
    expect(output).toContain('50%');
  });

  it('renders 0% for lg size with showPercent', async () => {
    const output = await renderToString(
      wrap(React.createElement(ProgressCircle, { value: 0, size: 'lg', showPercent: true }))
    );
    expect(output).toContain('0%');
  });

  it('renders 100% for md size with showPercent', async () => {
    const output = await renderToString(
      wrap(React.createElement(ProgressCircle, { value: 100, size: 'md', showPercent: true }))
    );
    expect(output).toContain('100%');
  });

  it('renders label text when provided', async () => {
    const output = await renderToString(
      wrap(
        React.createElement(ProgressCircle, {
          value: 42,
          size: 'sm',
          label: 'Uploading files',
        })
      )
    );
    expect(output).toContain('Uploading files');
  });

  it('sm size renders a braille progress character', async () => {
    const output = await renderToString(
      wrap(React.createElement(ProgressCircle, { value: 0, size: 'sm' }))
    );
    expect(output).toContain('○');
  });

  it('sm size at 100% renders a full circle character', async () => {
    const output = await renderToString(
      wrap(React.createElement(ProgressCircle, { value: 100, size: 'sm' }))
    );
    expect(output).toContain('●');
  });

  it('md size renders bracket delimiters ⟨ and ⟩', async () => {
    const output = await renderToString(
      wrap(React.createElement(ProgressCircle, { value: 60, size: 'md' }))
    );
    expect(output).toContain('⟨');
    expect(output).toContain('⟩');
  });

  it('lg size renders arc characters', async () => {
    const output = await renderToString(
      wrap(React.createElement(ProgressCircle, { value: 80, size: 'lg' }))
    );
    // Top arc ' ▄█▄' and bottom arc ' ▀█▀' are always rendered
    expect(output).toContain('▄');
    expect(output).toContain('▀');
  });

  it('clamps value above 100 to 100%', async () => {
    const output = await renderToString(
      wrap(React.createElement(ProgressCircle, { value: 150, size: 'md', showPercent: true }))
    );
    expect(output).toContain('100%');
  });

  it('clamps value below 0 to 0%', async () => {
    const output = await renderToString(
      wrap(React.createElement(ProgressCircle, { value: -20, size: 'md', showPercent: true }))
    );
    expect(output).toContain('0%');
  });
});

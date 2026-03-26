import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from '@termui/testing';
import { ThemeProvider } from '@termui/core';
import { StreamingText } from './StreamingText.js';

const e = React.createElement;

function wrap(child: React.ReactElement): React.ReactElement {
  return e(ThemeProvider, {}, child);
}

// ── Export smoke test ──────────────────────────────────────────────────────

describe('StreamingText export', () => {
  it('is exported as a function', () => {
    expect(typeof StreamingText).toBe('function');
  });
});

// ── Text content rendering ─────────────────────────────────────────────────
// When `text` prop is provided (controlled, no stream, no animate),
// displayText = text and isStreaming stays false.

describe('StreamingText renders text content', () => {
  it('renders the provided text prop', async () => {
    const output = await renderToString(wrap(e(StreamingText, { text: 'Hello world' })));
    expect(output).toContain('Hello world');
  });

  it('renders an empty string without crashing', async () => {
    const output = await renderToString(wrap(e(StreamingText, { text: '' })));
    // empty string — no content expected, just no crash
    expect(typeof output).toBe('string');
  });

  it('renders multi-line text joined as a single text node', async () => {
    const output = await renderToString(wrap(e(StreamingText, { text: 'line one line two' })));
    expect(output).toContain('line one');
    expect(output).toContain('line two');
  });
});

// ── Cursor visibility ──────────────────────────────────────────────────────
// cursor block character ▌ is only rendered when showCursor is true.
// showCursor = cursor && isStreaming && cursorVisible.
// For a static `text` prop (no stream, no animate), isStreaming is false,
// so the cursor is never shown regardless of the `cursor` prop.

describe('StreamingText cursor visibility', () => {
  it('does not show ▌ cursor when not streaming (static text, cursor=true)', async () => {
    const output = await renderToString(wrap(e(StreamingText, { text: 'static', cursor: true })));
    expect(output).not.toContain('▌');
  });

  it('does not show ▌ cursor when cursor=false', async () => {
    const output = await renderToString(
      wrap(e(StreamingText, { text: 'no cursor', cursor: false }))
    );
    expect(output).not.toContain('▌');
  });

  it('still contains text when cursor is disabled', async () => {
    const output = await renderToString(wrap(e(StreamingText, { text: 'visible', cursor: false })));
    expect(output).toContain('visible');
  });
});

// ── showCursor logic (pure) ────────────────────────────────────────────────
// Mirrors: const showCursor = cursor && isStreaming && cursorVisible;

function shouldShowCursor(cursor: boolean, isStreaming: boolean, cursorVisible: boolean): boolean {
  return cursor && isStreaming && cursorVisible;
}

describe('StreamingText showCursor logic', () => {
  it('returns true when all three conditions are true', () => {
    expect(shouldShowCursor(true, true, true)).toBe(true);
  });

  it('returns false when cursor prop is false', () => {
    expect(shouldShowCursor(false, true, true)).toBe(false);
  });

  it('returns false when not streaming', () => {
    expect(shouldShowCursor(true, false, true)).toBe(false);
  });

  it('returns false when cursor blink is invisible phase', () => {
    expect(shouldShowCursor(true, true, false)).toBe(false);
  });

  it('returns false when all conditions are false', () => {
    expect(shouldShowCursor(false, false, false)).toBe(false);
  });
});

// ── displayText logic (pure) ───────────────────────────────────────────────
// Mirrors the displayText computation:
//   stream ? internalText
//   : animate && controlledText ? controlledText.slice(0, animatedIndex)
//   : (controlledText ?? '')

function resolveDisplayText(
  controlledText: string | undefined,
  internalText: string,
  hasStream: boolean,
  animate: boolean,
  animatedIndex: number
): string {
  if (hasStream) return internalText;
  if (animate && controlledText) return controlledText.slice(0, animatedIndex);
  return controlledText ?? '';
}

describe('StreamingText displayText resolution', () => {
  it('uses internalText when streaming via AsyncIterable', () => {
    expect(resolveDisplayText(undefined, 'streamed', true, false, 0)).toBe('streamed');
  });

  it('uses full controlledText when not animate and no stream', () => {
    expect(resolveDisplayText('hello', '', false, false, 0)).toBe('hello');
  });

  it('uses empty string when controlledText is undefined and no stream', () => {
    expect(resolveDisplayText(undefined, '', false, false, 0)).toBe('');
  });

  it('slices controlledText to animatedIndex when animate=true', () => {
    expect(resolveDisplayText('Hello', '', false, true, 3)).toBe('Hel');
  });

  it('returns empty slice at index 0 when animate=true', () => {
    expect(resolveDisplayText('Hello', '', false, true, 0)).toBe('');
  });

  it('stream takes precedence over animate', () => {
    expect(resolveDisplayText('Hello', 'from stream', true, true, 2)).toBe('from stream');
  });
});

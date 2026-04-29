import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { renderToString, createTestRenderer } from '@termui/testing';
import { ThemeProvider } from '@termui/core';
import { BigText } from './BigText.js';

function renderBig(node: React.ReactElement): Promise<string> {
  return renderToString(<ThemeProvider>{node}</ThemeProvider>);
}

const tr = createTestRenderer();
afterEach(() => tr.cleanup());

async function renderRaw(node: React.ReactElement): Promise<string> {
  const result = tr.render(<ThemeProvider>{node}</ThemeProvider>);
  await new Promise<void>((r) => setTimeout(r, 50));
  return result.rerender().rawOutput;
}

describe('BigText — basic engine (default)', () => {
  it('renders without cfonts installed', async () => {
    const out = await renderBig(<BigText>HI</BigText>);
    // basic engine emits exactly 5 rows of bitmap output
    const lines = out.split('\n').filter((l) => l.trim().length > 0);
    expect(lines.length).toBeGreaterThanOrEqual(5);
  });

  it('uses block characters for filled pixels', async () => {
    const out = await renderBig(<BigText>OK</BigText>);
    expect(out).toContain('█');
  });

  it('falls back to a placeholder glyph for unknown characters', async () => {
    // '@' is not in the FONT map → should still render (FALLBACK glyph), not throw
    const out = await renderBig(<BigText>{'@'}</BigText>);
    expect(out).toContain('█');
  });

  it('honours an explicit color', async () => {
    const raw = await renderRaw(<BigText color="cyan">HI</BigText>);
    // Ink emits ANSI 36 for cyan in <Text color="cyan">
    expect(raw).toMatch(/\x1b\[36m|\x1b\[36;/);
  });
});

describe('BigText — cfonts engine (opt-in)', () => {
  it('renders multiple lines for a known cfonts font', async () => {
    const out = await renderBig(
      <BigText engine="cfonts" font="tiny">
        OK
      </BigText>
    );
    const lines = out.split('\n').filter((l) => l.trim().length > 0);
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });

  it('produces multiple distinct true-color escapes for a gradient', async () => {
    const raw = await renderRaw(
      <BigText engine="cfonts" font="tiny" gradient={['red', 'magenta']} transitionGradient>
        TERMUI
      </BigText>
    );
    // Each character in a transitionGradient gets its own RGB triplet — expect
    // at least a handful of distinct \x1b[38;2;R;G;B m sequences.
    const matches = raw.match(/\x1b\[38;2;\d+;\d+;\d+m/g) ?? [];
    const distinct = new Set(matches);
    expect(distinct.size).toBeGreaterThanOrEqual(4);
  });

  it('does not throw when font is unknown (falls back to basic)', async () => {
    const out = await renderBig(
      <BigText engine="cfonts" font={'no-such-font' as 'block'}>
        HI
      </BigText>
    );
    expect(out).toContain('█');
  });
});

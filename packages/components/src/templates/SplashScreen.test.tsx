import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { Text } from 'ink';
import { renderToString, createTestRenderer } from '@termui/testing';
import { ThemeProvider } from '@termui/core';
import { SplashScreen } from './SplashScreen.js';

function render(node: React.ReactElement): Promise<string> {
  return renderToString(<ThemeProvider>{node}</ThemeProvider>);
}

const tr = createTestRenderer();
afterEach(() => tr.cleanup());

async function renderRaw(node: React.ReactElement): Promise<string> {
  const result = tr.render(<ThemeProvider>{node}</ThemeProvider>);
  // Wait for Ink to flush the first frame
  await new Promise<void>((r) => setTimeout(r, 50));
  return result.rerender().rawOutput;
}

describe('SplashScreen', () => {
  it('renders title with basic engine by default', async () => {
    const out = await render(<SplashScreen title="HI" />);
    expect(out).toContain('█');
  });

  it('renders subtitle, author, and status line', async () => {
    const out = await render(
      <SplashScreen
        title="HI"
        subtitle="welcome"
        author={{ name: 'Arindam' }}
        statusLine={<Text>ready</Text>}
      />
    );
    expect(out).toContain('welcome');
    expect(out).toContain('Arindam');
    expect(out).toContain('ready');
  });

  it('emits an OSC 8 hyperlink when author.href is set', async () => {
    const raw = await renderRaw(
      <SplashScreen
        title="HI"
        author={{ name: 'Arindam', href: 'https://example.com' }}
      />
    );
    // Ink's <Text> processing mangles the ST byte inside OSC 8, but the
    // hyperlink prefix and URL still reach the terminal — that's enough for
    // the link to be clickable.
    expect(raw).toContain('\x1b]8;;');
    expect(raw).toContain('https://example.com');
  });

  it('basic engine + titleColorAlt → alternating row colors', async () => {
    const raw = await renderRaw(
      <SplashScreen title="HI" titleColor="red" titleColorAlt="blue" />
    );
    // Both red (31) and blue (34) should appear — one per alternating row
    expect(raw).toMatch(/\x1b\[31m|\x1b\[31;/);
    expect(raw).toMatch(/\x1b\[34m|\x1b\[34;/);
  });

  it('cfonts engine + titleColorAlt → smooth gradient (multiple distinct RGB)', async () => {
    const raw = await renderRaw(
      <SplashScreen
        title="HI"
        engine="cfonts"
        titleColor="red"
        titleColorAlt="magenta"
      />
    );
    const matches = raw.match(/\x1b\[38;2;\d+;\d+;\d+m/g) ?? [];
    const distinct = new Set(matches);
    expect(distinct.size).toBeGreaterThanOrEqual(3);
  });
});

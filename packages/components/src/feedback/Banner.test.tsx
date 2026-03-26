import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from '@termui/testing';
import { ThemeProvider } from '@termui/core';
import { Banner } from './Banner.js';

function wrap(el: React.ReactElement) {
  return React.createElement(ThemeProvider, {}, el);
}

describe('Banner', () => {
  it('renders children text', async () => {
    const output = await renderToString(wrap(<Banner>Deployment succeeded</Banner>));
    expect(output).toContain('Deployment succeeded');
  });

  it('renders title text', async () => {
    const output = await renderToString(
      wrap(
        <Banner variant="success" title="All Good">
          Everything passed
        </Banner>
      )
    );
    expect(output).toContain('All Good');
    expect(output).toContain('Everything passed');
  });

  it('renders info icon ℹ by default', async () => {
    const output = await renderToString(wrap(<Banner>Heads up</Banner>));
    expect(output).toContain('ℹ');
  });

  it('renders success icon ✓', async () => {
    const output = await renderToString(wrap(<Banner variant="success">Build passed</Banner>));
    expect(output).toContain('✓');
  });

  it('renders error icon ✗', async () => {
    const output = await renderToString(wrap(<Banner variant="error">Build failed</Banner>));
    expect(output).toContain('✗');
  });

  it('renders warning icon ⚠', async () => {
    const output = await renderToString(wrap(<Banner variant="warning">Low disk space</Banner>));
    expect(output).toContain('⚠');
  });

  it('renders neutral icon ·', async () => {
    const output = await renderToString(wrap(<Banner variant="neutral">Nothing special</Banner>));
    expect(output).toContain('·');
  });

  it('renders custom icon override', async () => {
    const output = await renderToString(
      wrap(
        <Banner variant="info" icon="★">
          Custom icon banner
        </Banner>
      )
    );
    expect(output).toContain('★');
    expect(output).toContain('Custom icon banner');
  });

  it('renders the left accent bar character ┃', async () => {
    const output = await renderToString(wrap(<Banner>With accent</Banner>));
    expect(output).toContain('┃');
  });

  it('renders a custom accent character', async () => {
    const output = await renderToString(wrap(<Banner accentChar="|">Custom accent</Banner>));
    expect(output).toContain('|');
    expect(output).toContain('Custom accent');
  });

  it('renders dismissible hint text', async () => {
    const output = await renderToString(wrap(<Banner dismissible>Dismiss me</Banner>));
    expect(output).toContain('press Esc to dismiss');
  });
});

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from '@termui/testing';
import { ThemeProvider } from '@termui/core';
import { Toast } from './Toast.js';

function wrap(el: React.ReactElement) {
  return React.createElement(ThemeProvider, {}, el);
}

describe('Toast', () => {
  it('renders message text', async () => {
    const output = await renderToString(
      wrap(<Toast message="Upload complete" duration={999999} />)
    );
    expect(output).toContain('Upload complete');
  });

  it('renders success icon ✓', async () => {
    const output = await renderToString(
      wrap(<Toast message="Done" variant="success" duration={999999} />)
    );
    expect(output).toContain('✓');
  });

  it('renders error icon ✗', async () => {
    const output = await renderToString(
      wrap(<Toast message="Failed" variant="error" duration={999999} />)
    );
    expect(output).toContain('✗');
  });

  it('renders warning icon ⚠', async () => {
    const output = await renderToString(
      wrap(<Toast message="Careful" variant="warning" duration={999999} />)
    );
    expect(output).toContain('⚠');
  });

  it('renders info icon ℹ', async () => {
    const output = await renderToString(
      wrap(<Toast message="Note" variant="info" duration={999999} />)
    );
    expect(output).toContain('ℹ');
  });

  it('defaults to info variant', async () => {
    const output = await renderToString(wrap(<Toast message="Default toast" duration={999999} />));
    expect(output).toContain('ℹ');
    expect(output).toContain('Default toast');
  });

  it('renders custom icon', async () => {
    const output = await renderToString(
      wrap(<Toast message="Custom" variant="success" icon="★" duration={999999} />)
    );
    expect(output).toContain('★');
    expect(output).toContain('Custom');
  });

  it('renders the countdown progress bar characters', async () => {
    const output = await renderToString(wrap(<Toast message="With bar" duration={999999} />));
    // At t=0 bar should be entirely filled (█ chars)
    expect(output).toContain('█');
  });
});

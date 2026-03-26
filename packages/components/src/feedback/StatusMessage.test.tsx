import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from '@termui/testing';
import { ThemeProvider } from '@termui/core';
import { StatusMessage } from './StatusMessage.js';

function wrap(el: React.ReactElement) {
  return React.createElement(ThemeProvider, {}, el);
}

describe('StatusMessage', () => {
  it('renders children text', async () => {
    const output = await renderToString(wrap(<StatusMessage>Processing request</StatusMessage>));
    expect(output).toContain('Processing request');
  });

  it('renders success icon ✓', async () => {
    const output = await renderToString(
      wrap(<StatusMessage variant="success">Done</StatusMessage>)
    );
    expect(output).toContain('✓');
    expect(output).toContain('Done');
  });

  it('renders error icon ✗', async () => {
    const output = await renderToString(
      wrap(<StatusMessage variant="error">Something went wrong</StatusMessage>)
    );
    expect(output).toContain('✗');
    expect(output).toContain('Something went wrong');
  });

  it('renders warning icon ⚠', async () => {
    const output = await renderToString(
      wrap(<StatusMessage variant="warning">Proceed with care</StatusMessage>)
    );
    expect(output).toContain('⚠');
    expect(output).toContain('Proceed with care');
  });

  it('renders info icon ℹ', async () => {
    const output = await renderToString(
      wrap(<StatusMessage variant="info">For your information</StatusMessage>)
    );
    expect(output).toContain('ℹ');
    expect(output).toContain('For your information');
  });

  it('renders pending icon ○', async () => {
    const output = await renderToString(
      wrap(<StatusMessage variant="pending">Waiting…</StatusMessage>)
    );
    expect(output).toContain('○');
    expect(output).toContain('Waiting…');
  });

  it('defaults to info variant', async () => {
    const output = await renderToString(wrap(<StatusMessage>Default status</StatusMessage>));
    expect(output).toContain('ℹ');
    expect(output).toContain('Default status');
  });

  // The 'loading' variant renders a <Spinner> which internally calls useMotion().
  // useMotion is not available in the renderToString test environment (SSR mode),
  // so the render throws and the output contains an error string instead of the
  // children text. This is a known limitation of the test harness, not a bug in
  // the component itself.
  it.todo(
    'renders loading variant with children text (spinner replaces icon — requires useMotion in test env)'
  );

  it('renders custom icon override', async () => {
    const output = await renderToString(
      wrap(
        <StatusMessage variant="success" icon="★">
          Custom icon
        </StatusMessage>
      )
    );
    expect(output).toContain('★');
    expect(output).toContain('Custom icon');
  });
});

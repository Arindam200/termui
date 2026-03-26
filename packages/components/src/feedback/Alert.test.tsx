import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from '@termui/testing';
import { ThemeProvider } from '@termui/core';
import { Alert } from './Alert.js';

function wrap(el: React.ReactElement) {
  return React.createElement(ThemeProvider, {}, el);
}

describe('Alert', () => {
  it('renders children text', async () => {
    const output = await renderToString(
      wrap(React.createElement(Alert, { variant: 'info' }, 'Something happened'))
    );
    expect(output).toContain('Something happened');
  });

  it('renders title', async () => {
    const output = await renderToString(
      wrap(React.createElement(Alert, { variant: 'success', title: 'Done!' }, 'All good'))
    );
    expect(output).toContain('Done!');
  });

  it('renders success icon ✓', async () => {
    const output = await renderToString(
      wrap(React.createElement(Alert, { variant: 'success' }, 'ok'))
    );
    expect(output).toContain('✓');
  });

  it('renders error icon ✗', async () => {
    const output = await renderToString(
      wrap(React.createElement(Alert, { variant: 'error' }, 'failed'))
    );
    expect(output).toContain('✗');
  });

  it('renders warning icon ⚠', async () => {
    const output = await renderToString(
      wrap(React.createElement(Alert, { variant: 'warning' }, 'careful'))
    );
    expect(output).toContain('⚠');
  });

  it('renders custom icon', async () => {
    const output = await renderToString(wrap(React.createElement(Alert, { icon: '★' }, 'custom')));
    expect(output).toContain('★');
  });

  it('defaults to info variant', async () => {
    const output = await renderToString(wrap(React.createElement(Alert, {}, 'neutral')));
    expect(output).toContain('ℹ');
    expect(output).toContain('neutral');
  });
});

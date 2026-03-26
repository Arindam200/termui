import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from '@termui/testing';
import { ThemeProvider } from '@termui/core';
import { Select } from './Select.js';

const OPTIONS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
];

function wrap(el: React.ReactElement) {
  return React.createElement(ThemeProvider, {}, el);
}

describe('Select', () => {
  it('renders all option labels', async () => {
    const output = await renderToString(wrap(React.createElement(Select, { options: OPTIONS })));
    expect(output).toContain('React');
    expect(output).toContain('Vue');
    expect(output).toContain('Svelte');
  });

  it('renders label when provided', async () => {
    const output = await renderToString(
      wrap(React.createElement(Select, { options: OPTIONS, label: 'Choose framework:' }))
    );
    expect(output).toContain('Choose framework:');
  });

  it('renders cursor › for active item', async () => {
    const output = await renderToString(wrap(React.createElement(Select, { options: OPTIONS })));
    expect(output).toContain('›');
  });

  it('respects custom cursor', async () => {
    const output = await renderToString(
      wrap(React.createElement(Select, { options: OPTIONS, cursor: '>' }))
    );
    expect(output).toContain('>');
  });

  it('renders hint text for options', async () => {
    const opts = [{ value: 'pnpm', label: 'pnpm', hint: 'recommended' }];
    const output = await renderToString(wrap(React.createElement(Select, { options: opts })));
    expect(output).toContain('pnpm');
    expect(output).toContain('recommended');
  });

  it('skips disabled options in output (label still shown)', async () => {
    const opts = [
      { value: 'a', label: 'Active' },
      { value: 'b', label: 'Disabled', disabled: true },
    ];
    const output = await renderToString(wrap(React.createElement(Select, { options: opts })));
    expect(output).toContain('Active');
    expect(output).toContain('Disabled');
  });
});

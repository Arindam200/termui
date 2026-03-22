import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { Text, Box } from 'ink';
import { renderToString, createTestRenderer } from './render.js';

const e = React.createElement;

describe('renderToString', () => {
  it('renders simple text', async () => {
    const output = await renderToString(e(Text, null, 'Hello'));
    expect(output).toBe('Hello');
  });

  it('strips ANSI codes from output', async () => {
    const output = await renderToString(e(Text, { color: 'green' }, 'Colored'));
    expect(output).toBe('Colored');
    expect(output).not.toContain('\x1b[');
  });

  it('renders nested elements', async () => {
    const output = await renderToString(
      e(Box, { flexDirection: 'column' }, e(Text, null, 'Line one'), e(Text, null, 'Line two'))
    );
    expect(output).toContain('Line one');
    expect(output).toContain('Line two');
  });

  it('trims leading and trailing whitespace', async () => {
    const output = await renderToString(e(Text, null, '  padded  '));
    expect(output).toBe('padded');
  });
});

describe('createTestRenderer', () => {
  const { render, cleanup } = createTestRenderer();
  afterEach(() => cleanup());

  it('renders an element and returns output', () => {
    const result = render(e(Text, null, 'hi'));
    expect(result.output).toContain('hi');
  });

  it('rawOutput contains ANSI codes for colored text', () => {
    const result = render(e(Text, { color: 'red' }, 'red text'));
    expect(result.rawOutput).toContain('\x1b[');
    expect(result.output).toBe('red text');
  });

  it('rerender() returns updated output object', () => {
    const result = render(e(Text, null, 'stable'));
    const rerendered = result.rerender();
    expect(rerendered.output).toBe(result.output);
  });

  it('unmount() does not throw', () => {
    const result = render(e(Text, null, 'bye'));
    expect(() => result.unmount()).not.toThrow();
  });

  it('cleanup() unmounts all instances without throwing', () => {
    render(e(Text, null, 'a'));
    render(e(Text, null, 'b'));
    expect(() => cleanup()).not.toThrow();
  });
});

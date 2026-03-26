import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, unlinkSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { stripVolatile, normalizeAnsi, toMatchSnapshot, updateSnapshot } from './snapshot.js';

describe('stripVolatile', () => {
  it('replaces spinner characters with [SPINNER]', () => {
    const input = '⠋ Loading';
    const result = stripVolatile(input);
    expect(result).toContain('[SPINNER]');
    expect(result).not.toContain('⠋');
  });

  it('replaces timestamps with [TIME]', () => {
    const input = 'Started at 12:34:56';
    const result = stripVolatile(input);
    expect(result).toContain('[TIME]');
    expect(result).not.toContain('12:34:56');
  });

  it('replaces blinking cursor ▌ with [CURSOR]', () => {
    const input = 'Typing▌';
    const result = stripVolatile(input);
    expect(result).toContain('[CURSOR]');
    expect(result).not.toContain('▌');
  });

  it('leaves static text unchanged', () => {
    const input = 'Hello world';
    expect(stripVolatile(input)).toBe('Hello world');
  });

  it('handles multiple spinner frames in one line', () => {
    const input = '⠋⠙⠹ Busy';
    const result = stripVolatile(input);
    expect(result).toContain('[SPINNER]');
    expect(result).toContain(' Busy');
  });
});

describe('normalizeAnsi', () => {
  it('strips ANSI escape codes', () => {
    const input = '\x1b[32mGreen text\x1b[0m';
    expect(normalizeAnsi(input)).toBe('Green text');
  });

  it('leaves plain text unchanged', () => {
    expect(normalizeAnsi('plain text')).toBe('plain text');
  });

  it('strips complex sequences', () => {
    const input = '\x1b[1m\x1b[36mBold Cyan\x1b[0m';
    expect(normalizeAnsi(input)).toBe('Bold Cyan');
  });
});

describe('toMatchSnapshot / updateSnapshot', () => {
  const tmpDir = join(tmpdir(), 'termui-snapshot-tests');
  let snapPath: string;

  beforeEach(() => {
    mkdirSync(tmpDir, { recursive: true });
    snapPath = join(tmpDir, `snap-${Date.now()}-${Math.random()}.snap`);
  });

  afterEach(() => {
    if (existsSync(snapPath)) unlinkSync(snapPath);
  });

  it('writes snapshot on first run', () => {
    const result = toMatchSnapshot('Hello world', snapPath);
    expect(result).toBe(true);
    expect(existsSync(snapPath)).toBe(true);
  });

  it('passes on second run when output matches', () => {
    toMatchSnapshot('Hello world', snapPath);
    const result = toMatchSnapshot('Hello world', snapPath);
    expect(result).toBe(true);
  });

  it('throws on mismatch with diff output', () => {
    toMatchSnapshot('Hello world', snapPath);
    expect(() => toMatchSnapshot('Different text', snapPath)).toThrow(/mismatch/i);
  });

  it('updateSnapshot overwrites existing snap', () => {
    toMatchSnapshot('original', snapPath);
    updateSnapshot('updated', snapPath);
    const result = toMatchSnapshot('updated', snapPath);
    expect(result).toBe(true);
  });

  it('strips volatile content before comparing', () => {
    // Both have spinner — should normalize to same thing
    toMatchSnapshot('⠋ Loading done', snapPath);
    const result = toMatchSnapshot('⠙ Loading done', snapPath);
    expect(result).toBe(true);
  });

  it('strips ANSI before comparing', () => {
    toMatchSnapshot('\x1b[32mGreen\x1b[0m', snapPath);
    const result = toMatchSnapshot('\x1b[31mGreen\x1b[0m', snapPath);
    expect(result).toBe(true);
  });
});

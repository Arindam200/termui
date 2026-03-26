import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chalk } from './index.js';

// Force colors on for all tests
const origForce = process.env['FORCE_COLOR'];
beforeAll(() => {
  process.env['FORCE_COLOR'] = '1';
  delete process.env['NO_COLOR'];
});
afterAll(() => {
  if (origForce !== undefined) process.env['FORCE_COLOR'] = origForce;
  else delete process.env['FORCE_COLOR'];
});

describe('chalk adapter', () => {
  it('applies red color', () => {
    const result = chalk.red('error');
    expect(result).toContain('error');
    expect(result).toMatch(/\x1b\[31m/);
  });

  it('applies green color', () => {
    const result = chalk.green('ok');
    expect(result).toContain('ok');
    expect(result).toMatch(/\x1b\[32m/);
  });

  it('applies bold modifier', () => {
    const result = chalk.bold('strong');
    expect(result).toContain('strong');
    expect(result).toMatch(/\x1b\[1m/);
  });

  it('chains bold + red', () => {
    const result = chalk.bold.red('danger');
    expect(result).toContain('danger');
    expect(result).toMatch(/\x1b\[1m/);
    expect(result).toMatch(/\x1b\[31m/);
  });

  it('applies background color', () => {
    const result = chalk.bgCyan.black(' INFO ');
    expect(result).toContain(' INFO ');
    expect(result).toMatch(/\x1b\[46m/); // bgCyan
    expect(result).toMatch(/\x1b\[30m/); // black
  });

  it('applies dim modifier', () => {
    const result = chalk.dim('quiet');
    expect(result).toMatch(/\x1b\[2m/);
  });

  it('supports hex color', () => {
    const result = chalk.hex('#FF6B6B')('custom');
    expect(result).toContain('custom');
    expect(result).toMatch(/\x1b\[38;2;/);
  });

  it('supports rgb color', () => {
    const result = chalk.rgb(255, 100, 0)('orange');
    expect(result).toContain('orange');
    expect(result).toMatch(/\x1b\[38;2;255;100;0m/);
  });

  it('supports ansi256 color', () => {
    const result = chalk.ansi256(208)('indexed');
    expect(result).toContain('indexed');
    expect(result).toMatch(/\x1b\[38;5;208m/);
  });

  it('returns plain text when NO_COLOR is set', () => {
    process.env['NO_COLOR'] = '1';
    delete process.env['FORCE_COLOR'];
    try {
      const result = chalk.red('plain');
      expect(result).toBe('plain');
    } finally {
      delete process.env['NO_COLOR'];
      process.env['FORCE_COLOR'] = '1';
    }
  });

  it('is callable directly as function', () => {
    const result = chalk('passthrough');
    expect(result).toBe('passthrough');
  });
});

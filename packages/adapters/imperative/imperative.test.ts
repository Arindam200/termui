import { describe, it, expect, vi, afterEach } from 'vitest';
import { intro, outro, log, spinner } from './index.js';
import type { TextOptions, SelectOptions, ConfirmOptions } from './index.js';

// Suppress console output during tests
afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Inline mirrors of pure logic (not exported from source) ─────────────────

function normalizeSelectOptions<T extends string>(options: SelectOptions<T>['options']) {
  return options.map((o) =>
    typeof o === 'string' ? { value: o as T, label: o, hint: undefined } : o
  );
}

function confirmDefault(opts: Pick<ConfirmOptions, 'initialValue'>): boolean {
  return opts.initialValue !== false;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('named exports', () => {
  it('exports intro as a function', () => {
    expect(typeof intro).toBe('function');
  });

  it('exports outro as a function', () => {
    expect(typeof outro).toBe('function');
  });

  it('exports log as an object', () => {
    expect(typeof log).toBe('object');
  });

  it('exports spinner as a function', () => {
    expect(typeof spinner).toBe('function');
  });
});

describe('log methods', () => {
  it('has info method', () => {
    expect(typeof log.info).toBe('function');
  });

  it('has success method', () => {
    expect(typeof log.success).toBe('function');
  });

  it('has warn method', () => {
    expect(typeof log.warn).toBe('function');
  });

  it('has error method', () => {
    expect(typeof log.error).toBe('function');
  });

  it('has step method', () => {
    expect(typeof log.step).toBe('function');
  });

  it('log.info calls console.log', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    log.info('test message');
    expect(spy).toHaveBeenCalledOnce();
    const call = spy.mock.calls[0]![0] as string;
    expect(call).toContain('test message');
  });

  it('log.success calls console.log with message', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    log.success('all done');
    expect(spy).toHaveBeenCalledOnce();
    const call = spy.mock.calls[0]![0] as string;
    expect(call).toContain('all done');
  });
});

describe('spinner()', () => {
  it('returns handle with start, stop, error', () => {
    const handle = spinner();
    expect(typeof handle.start).toBe('function');
    expect(typeof handle.stop).toBe('function');
    expect(typeof handle.error).toBe('function');
  });

  it('start does not throw', () => {
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const handle = spinner();
    expect(() => handle.start('loading')).not.toThrow();
    handle.stop();
  });

  it('stop calls console.log with message', () => {
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const handle = spinner();
    handle.start('working');
    handle.stop('done');
    expect(spy).toHaveBeenCalled();
    const output = spy.mock.calls.flat().join(' ');
    expect(output).toContain('done');
  });

  it('error stops spinner and logs message', () => {
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const handle = spinner();
    handle.start('working');
    handle.error('failed!');
    const output = spy.mock.calls.flat().join(' ');
    expect(output).toContain('failed!');
  });
});

describe('select option normalisation logic', () => {
  it('converts string options to objects', () => {
    const result = normalizeSelectOptions<string>(['npm', 'pnpm', 'bun']);
    expect(result).toEqual([
      { value: 'npm', label: 'npm', hint: undefined },
      { value: 'pnpm', label: 'pnpm', hint: undefined },
      { value: 'bun', label: 'bun', hint: undefined },
    ]);
  });

  it('passes through object options unchanged', () => {
    const opts = [{ value: 'npm' as const, label: 'NPM', hint: 'classic' }];
    expect(normalizeSelectOptions(opts)).toEqual(opts);
  });

  it('handles mixed string and object options', () => {
    const result = normalizeSelectOptions<string>([
      'alpha',
      { value: 'beta', label: 'Beta', hint: 'new' },
    ]);
    expect(result[0]).toEqual({ value: 'alpha', label: 'alpha', hint: undefined });
    expect(result[1]).toEqual({ value: 'beta', label: 'Beta', hint: 'new' });
  });
});

describe('confirm default logic', () => {
  it('defaults to true when initialValue is undefined', () => {
    expect(confirmDefault({})).toBe(true);
  });

  it('defaults to true when initialValue is true', () => {
    expect(confirmDefault({ initialValue: true })).toBe(true);
  });

  it('defaults to false when initialValue is false', () => {
    expect(confirmDefault({ initialValue: false })).toBe(false);
  });
});

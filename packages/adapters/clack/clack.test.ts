import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { intro, outro, spinner, log } from './index.js';

// ── Helpers ────────────────────────────────────────────────────────────────

function stripAnsi(str: string): string {
  // Remove all ESC sequences (colours, bold, etc.)
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

// ── intro / outro ──────────────────────────────────────────────────────────

describe('intro', () => {
  beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('calls console.log once', () => {
    intro('My App');
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  it('output contains the title', () => {
    intro('Hello World');
    const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
    expect(stripAnsi(output)).toContain('Hello World');
  });
});

describe('outro', () => {
  beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('calls console.log once', () => {
    outro('Done!');
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  it('output contains the message', () => {
    outro('All finished');
    const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
    expect(stripAnsi(output)).toContain('All finished');
  });
});

// ── log object ─────────────────────────────────────────────────────────────

describe('log.info', () => {
  beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('calls console.log', () => {
    log.info('test message');
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  it('output contains the message text', () => {
    log.info('hello info');
    const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
    expect(stripAnsi(output)).toContain('hello info');
  });
});

describe('log.success', () => {
  beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('calls console.log', () => {
    log.success('it worked');
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  it('output contains the message text', () => {
    log.success('great job');
    const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
    expect(stripAnsi(output)).toContain('great job');
  });
});

describe('log.warn', () => {
  beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('calls console.log', () => {
    log.warn('be careful');
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  it('output contains the message text', () => {
    log.warn('warning issued');
    const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
    expect(stripAnsi(output)).toContain('warning issued');
  });
});

describe('log.error', () => {
  beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('calls console.log', () => {
    log.error('something broke');
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  it('output contains the message text', () => {
    log.error('fatal error');
    const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
    expect(stripAnsi(output)).toContain('fatal error');
  });
});

describe('log.step', () => {
  beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('calls console.log', () => {
    log.step('running step');
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  it('output contains the message text', () => {
    log.step('step one');
    const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
    expect(stripAnsi(output)).toContain('step one');
  });
});

// ── log object shape ───────────────────────────────────────────────────────

describe('log object shape', () => {
  it('exposes info, success, warn, error and step methods', () => {
    expect(typeof log.info).toBe('function');
    expect(typeof log.success).toBe('function');
    expect(typeof log.warn).toBe('function');
    expect(typeof log.error).toBe('function');
    expect(typeof log.step).toBe('function');
  });
});

// ── spinner ────────────────────────────────────────────────────────────────

describe('spinner()', () => {
  it('returns an object with start, stop and message methods', () => {
    const s = spinner();
    expect(typeof s.start).toBe('function');
    expect(typeof s.stop).toBe('function');
    expect(typeof s.message).toBe('function');
  });

  it('calling start and stop does not throw', () => {
    const s = spinner();
    expect(() => {
      s.start('loading…');
      s.stop('done');
    }).not.toThrow();
  });

  it('calling message() does not throw', () => {
    const s = spinner();
    expect(() => {
      s.start();
      s.message('updated message');
      s.stop();
    }).not.toThrow();
  });

  it('stop() logs a message when one is provided (non-TTY env)', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const s = spinner();
    s.start('working');
    s.stop('finished!');
    // In non-TTY test environments, stop() with a message calls console.log
    const calls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
    const hasFinished = calls.some(
      ([arg]) => typeof arg === 'string' && stripAnsi(arg).includes('finished!')
    );
    expect(hasFinished).toBe(true);
    vi.restoreAllMocks();
  });

  it('each call to spinner() returns a fresh instance', () => {
    const s1 = spinner();
    const s2 = spinner();
    expect(s1).not.toBe(s2);
  });
});

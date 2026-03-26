import { describe, it, expect } from 'vitest';
import { meow } from './index.js';

// Override process.argv for tests
function withArgs(args: string[], fn: () => void) {
  const orig = process.argv;
  process.argv = ['node', 'cli.js', ...args];
  try {
    fn();
  } finally {
    process.argv = orig;
  }
}

describe('meow adapter', () => {
  it('parses positional input', () => {
    let result!: ReturnType<typeof meow>;
    withArgs(['build', 'src'], () => {
      result = meow('Usage: mycli <cmd>', {});
    });
    expect(result.input).toEqual(['build', 'src']);
  });

  it('parses string flag', () => {
    let result!: ReturnType<typeof meow>;
    withArgs(['--env', 'production'], () => {
      result = meow('', {
        flags: { env: { type: 'string' } },
      });
    });
    expect(result.flags['env']).toBe('production');
  });

  it('parses boolean flag', () => {
    let result!: ReturnType<typeof meow>;
    withArgs(['--verbose'], () => {
      result = meow('', {
        flags: { verbose: { type: 'boolean' } },
      });
    });
    expect(result.flags['verbose']).toBe(true);
  });

  it('parses number flag', () => {
    let result!: ReturnType<typeof meow>;
    withArgs(['--port', '3000'], () => {
      result = meow('', {
        flags: { port: { type: 'number' } },
      });
    });
    expect(result.flags['port']).toBe(3000);
  });

  it('uses default value when flag not provided', () => {
    let result!: ReturnType<typeof meow>;
    withArgs([], () => {
      result = meow('', {
        flags: { env: { type: 'string', default: 'development' } },
      });
    });
    expect(result.flags['env']).toBe('development');
  });

  it('parses short flag alias', () => {
    let result!: ReturnType<typeof meow>;
    withArgs(['-v'], () => {
      result = meow('', {
        flags: { verbose: { type: 'boolean', shortFlag: 'v' } },
      });
    });
    expect(result.flags['verbose']).toBe(true);
  });

  it('stops at -- separator', () => {
    let result!: ReturnType<typeof meow>;
    withArgs(['--verbose', '--', '--not-a-flag'], () => {
      result = meow('', {
        flags: { verbose: { type: 'boolean' } },
      });
    });
    // Input should contain '--not-a-flag' as positional
    expect(result.input).toContain('--not-a-flag');
  });

  it('exposes showHelp and showVersion functions', () => {
    let result!: ReturnType<typeof meow>;
    withArgs([], () => {
      result = meow('Usage: test', { flags: {} });
    });
    expect(typeof result.showHelp).toBe('function');
    expect(typeof result.showVersion).toBe('function');
  });

  it('help text is accessible', () => {
    let result!: ReturnType<typeof meow>;
    withArgs([], () => {
      result = meow('Usage: mycli [options]', {});
    });
    expect(result.help).toContain('Usage: mycli');
  });
});

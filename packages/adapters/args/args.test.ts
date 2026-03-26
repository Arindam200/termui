import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCLI, createMinimalCLI } from './index.js';
import type { CLIConfig } from './index.js';

// ── Fixture CLI config ─────────────────────────────────────────────────────

const config: CLIConfig = {
  name: 'mycli',
  version: '1.0.0',
  description: 'A test CLI',
  commands: {
    build: {
      name: 'build',
      description: 'Build the project',
      args: {
        output: {
          description: 'Output directory',
          default: 'dist',
        },
        minify: {
          description: 'Enable minification',
        },
      },
    },
    deploy: {
      name: 'deploy',
      description: 'Deploy the project',
      args: {
        env: {
          description: 'Target environment',
          required: true,
        },
      },
    },
    simple: {
      name: 'simple',
      description: 'A command with no args',
    },
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

// ── createCLI export ───────────────────────────────────────────────────────

describe('createCLI export', () => {
  it('is a function', () => {
    expect(typeof createCLI).toBe('function');
  });

  it('returns an object with parse, help and version methods', () => {
    const cli = createCLI(config);
    expect(typeof cli.parse).toBe('function');
    expect(typeof cli.help).toBe('function');
    expect(typeof cli.version).toBe('function');
  });
});

// ── parse — basic command + --key value form ───────────────────────────────

describe('parse — --key value', () => {
  it('returns the command name', () => {
    const cli = createCLI(config);
    const result = cli.parse(['build', '--output', 'out']);
    expect(result).not.toBeNull();
    expect(result!.command).toBe('build');
  });

  it('parses --key value into args', () => {
    const cli = createCLI(config);
    const result = cli.parse(['build', '--output', 'out']);
    expect(result!.args['output']).toBe('out');
  });

  it('applies defaults for missing optional args', () => {
    const cli = createCLI(config);
    const result = cli.parse(['build']);
    expect(result!.args['output']).toBe('dist');
  });

  it('treats a flag with no following value as boolean true', () => {
    const cli = createCLI(config);
    const result = cli.parse(['build', '--minify']);
    expect(result!.args['minify']).toBe(true);
  });
});

// ── parse — --key=value form ───────────────────────────────────────────────

describe('parse — --key=value', () => {
  it('parses --key=value correctly', () => {
    const cli = createCLI(config);
    const result = cli.parse(['build', '--output=custom']);
    expect(result!.args['output']).toBe('custom');
  });

  it('parses --key=value with numeric value and coerces to number', () => {
    const cli = createCLI(config);
    const result = cli.parse(['build', '--port=8080']);
    expect(result!.args['port']).toBe(8080);
  });

  it('parses --key=true and coerces to boolean', () => {
    const cli = createCLI(config);
    const result = cli.parse(['build', '--minify=true']);
    expect(result!.args['minify']).toBe(true);
  });

  it('parses --key=false and coerces to boolean', () => {
    const cli = createCLI(config);
    const result = cli.parse(['build', '--minify=false']);
    expect(result!.args['minify']).toBe(false);
  });
});

// ── parse — value coercion ─────────────────────────────────────────────────

describe('parse — value coercion', () => {
  it('coerces numeric string to number', () => {
    const cli = createCLI(config);
    const result = cli.parse(['build', '--workers', '4']);
    expect(result!.args['workers']).toBe(4);
  });

  it('coerces "true" string to boolean true', () => {
    const cli = createCLI(config);
    const result = cli.parse(['build', '--verbose', 'true']);
    expect(result!.args['verbose']).toBe(true);
  });

  it('coerces "false" string to boolean false', () => {
    const cli = createCLI(config);
    const result = cli.parse(['build', '--verbose', 'false']);
    expect(result!.args['verbose']).toBe(false);
  });

  it('coerces "null" string to null', () => {
    const cli = createCLI(config);
    const result = cli.parse(['build', '--tag', 'null']);
    expect(result!.args['tag']).toBeNull();
  });

  it('leaves regular strings unchanged', () => {
    const cli = createCLI(config);
    const result = cli.parse(['build', '--output', 'my-dir']);
    expect(result!.args['output']).toBe('my-dir');
  });
});

// ── parse — --help / -h ────────────────────────────────────────────────────

describe('parse — --help / -h flags', () => {
  beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('returns null and calls help() for --help', () => {
    const cli = createCLI(config);
    const result = cli.parse(['--help']);
    expect(result).toBeNull();
    expect(console.log).toHaveBeenCalled();
  });

  it('returns null and calls help() for -h', () => {
    const cli = createCLI(config);
    const result = cli.parse(['-h']);
    expect(result).toBeNull();
    expect(console.log).toHaveBeenCalled();
  });

  it('returns null and calls help() when argv is empty', () => {
    const cli = createCLI(config);
    const result = cli.parse([]);
    expect(result).toBeNull();
    expect(console.log).toHaveBeenCalled();
  });

  it('returns null and calls help() for the "help" subcommand', () => {
    const cli = createCLI(config);
    const result = cli.parse(['help']);
    expect(result).toBeNull();
    expect(console.log).toHaveBeenCalled();
  });
});

// ── parse — --version / -v ─────────────────────────────────────────────────

describe('parse — --version / -v flags', () => {
  beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('returns null for --version', () => {
    const cli = createCLI(config);
    const result = cli.parse(['--version']);
    expect(result).toBeNull();
  });

  it('prints version string containing name and version', () => {
    const cli = createCLI(config);
    cli.parse(['--version']);
    const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
    expect(output).toContain('mycli');
    expect(output).toContain('1.0.0');
  });

  it('returns null for -v', () => {
    const cli = createCLI(config);
    const result = cli.parse(['-v']);
    expect(result).toBeNull();
  });
});

// ── parse — a command with no defined args ─────────────────────────────────

describe('parse — command with no args definition', () => {
  it('returns the command with an empty args object', () => {
    const cli = createCLI(config);
    const result = cli.parse(['simple']);
    expect(result).not.toBeNull();
    expect(result!.command).toBe('simple');
    expect(result!.args).toEqual({});
  });
});

// ── help() output ──────────────────────────────────────────────────────────

describe('help()', () => {
  beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('calls console.log at least once', () => {
    const cli = createCLI(config);
    cli.help();
    expect(console.log).toHaveBeenCalled();
  });

  it('output contains the CLI name', () => {
    const cli = createCLI(config);
    cli.help();
    const allOutput = (console.log as ReturnType<typeof vi.fn>).mock.calls
      .map(([arg]) => stripAnsi(String(arg)))
      .join('\n');
    expect(allOutput).toContain('mycli');
  });

  it('output contains the version', () => {
    const cli = createCLI(config);
    cli.help();
    const allOutput = (console.log as ReturnType<typeof vi.fn>).mock.calls
      .map(([arg]) => stripAnsi(String(arg)))
      .join('\n');
    expect(allOutput).toContain('1.0.0');
  });

  it('output lists registered commands', () => {
    const cli = createCLI(config);
    cli.help();
    const allOutput = (console.log as ReturnType<typeof vi.fn>).mock.calls
      .map(([arg]) => stripAnsi(String(arg)))
      .join('\n');
    expect(allOutput).toContain('build');
    expect(allOutput).toContain('deploy');
  });
});

// ── version() output ───────────────────────────────────────────────────────

describe('version()', () => {
  beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('outputs the CLI name and version', () => {
    const cli = createCLI(config);
    cli.version();
    const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
    expect(output).toContain('mycli');
    expect(output).toContain('1.0.0');
  });
});

// ── Multiple args in one call ──────────────────────────────────────────────

describe('parse — multiple args mixed styles', () => {
  it('handles a mix of --key value and --key=value in one call', () => {
    const cli = createCLI(config);
    const result = cli.parse(['build', '--output', 'prod', '--minify=true']);
    expect(result!.args['output']).toBe('prod');
    expect(result!.args['minify']).toBe(true);
  });
});

// ── createMinimalCLI — basic usage ────────────────────────────────────────

describe('createMinimalCLI — basic usage', () => {
  it('is the same function reference as createCLI', () => {
    expect(createMinimalCLI).toBe(createCLI);
  });

  it('returns an object with parse, help and version methods', () => {
    const cli = createMinimalCLI({ name: 'minimal', version: '0.0.1', commands: {} });
    expect(typeof cli.parse).toBe('function');
    expect(typeof cli.help).toBe('function');
    expect(typeof cli.version).toBe('function');
  });
});

// ── createMinimalCLI — help output with name ──────────────────────────────

describe('createMinimalCLI — help output', () => {
  beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('--help output includes the CLI name', () => {
    const cli = createMinimalCLI({ name: 'my-tool', version: '1.0.0', commands: {} });
    cli.parse(['--help']);
    const allOutput = (console.log as ReturnType<typeof vi.fn>).mock.calls
      .map(([arg]) => stripAnsi(String(arg)))
      .join('\n');
    expect(allOutput).toContain('my-tool');
  });

  it('help() with an empty commands object still renders the CLI name', () => {
    const cli = createMinimalCLI({ name: 'empty-cli', version: '0.1.0', commands: {} });
    cli.help();
    const allOutput = (console.log as ReturnType<typeof vi.fn>).mock.calls
      .map(([arg]) => stripAnsi(String(arg)))
      .join('\n');
    expect(allOutput).toContain('empty-cli');
  });
});

// ── createCLI — version in help output ────────────────────────────────────

describe('createCLI — version in help output', () => {
  beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('help() output includes the version string', () => {
    const cli = createCLI({ name: 'my-cli', version: '1.0.0', commands: {} });
    cli.help();
    const allOutput = (console.log as ReturnType<typeof vi.fn>).mock.calls
      .map(([arg]) => stripAnsi(String(arg)))
      .join('\n');
    expect(allOutput).toContain('1.0.0');
  });

  it('help() output includes both name and version together', () => {
    const cli = createCLI({ name: 'versioned-cli', version: '2.5.3', commands: {} });
    cli.help();
    const allOutput = (console.log as ReturnType<typeof vi.fn>).mock.calls
      .map(([arg]) => stripAnsi(String(arg)))
      .join('\n');
    expect(allOutput).toContain('versioned-cli');
    expect(allOutput).toContain('2.5.3');
  });

  it('help() output includes description when provided', () => {
    const cli = createCLI({
      name: 'described-cli',
      version: '1.0.0',
      description: 'Builds and deploys things',
      commands: {},
    });
    cli.help();
    const allOutput = (console.log as ReturnType<typeof vi.fn>).mock.calls
      .map(([arg]) => stripAnsi(String(arg)))
      .join('\n');
    expect(allOutput).toContain('Builds and deploys things');
  });
});

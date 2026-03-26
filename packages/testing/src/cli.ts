/**
 * CLI testing utilities for TermUI apps.
 *
 * @example
 * ```ts
 * import { testCLI, mockRegistry, mockFS } from '@termui/testing';
 *
 * const result = await testCLI('npx termui list');
 * expect(result.exitCode).toBe(0);
 * expect(result.stdout).toContain('spinner');
 * ```
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { tmpdir } from 'os';
import { join } from 'path';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'fs';
import stripAnsi from 'strip-ansi';

const execFileAsync = promisify(execFile);

export interface CLIResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  /** stdout with ANSI codes stripped */
  output: string;
}

export interface TestCLIOptions {
  /** Working directory for the CLI process (default: temp dir) */
  cwd?: string;
  /** Environment variables to set */
  env?: Record<string, string>;
  /** Timeout in milliseconds (default: 15000) */
  timeout?: number;
  /** Stdin to feed to the process */
  stdin?: string;
}

/**
 * Run a CLI command in a subprocess and capture stdout/stderr/exitCode.
 *
 * @param command - Full command string e.g. 'node dist/cli.js list'
 * @param options - Options for the subprocess
 */
export async function testCLI(command: string, options: TestCLIOptions = {}): Promise<CLIResult> {
  const { cwd = tmpdir(), env = {}, timeout = 15_000 } = options;

  const [bin, ...args] = command.trim().split(/\s+/);

  try {
    const { stdout, stderr } = await execFileAsync(bin!, args, {
      cwd,
      timeout,
      env: {
        ...process.env,
        NO_COLOR: '1', // strip colors for stable output
        CI: '1', // disable animations
        ...env,
      },
    });

    return {
      stdout,
      stderr,
      exitCode: 0,
      output: stripAnsi(stdout).trim(),
    };
  } catch (err: unknown) {
    // execFile throws on non-zero exit
    const e = err as { stdout?: string; stderr?: string; code?: number };
    const stdout = e.stdout ?? '';
    const stderr = e.stderr ?? '';
    const exitCode = typeof e.code === 'number' ? e.code : 1;
    return {
      stdout,
      stderr,
      exitCode,
      output: stripAnsi(stdout).trim(),
    };
  }
}

// ─── mockRegistry ──────────────────────────────────────────────────────────

export interface MockRegistryComponent {
  name: string;
  description?: string;
  version?: string;
  category?: string;
  files?: string[];
  deps?: string[];
  peerComponents?: string[];
  /** Source content for each file. Key = filename, value = source string */
  source?: Record<string, string>;
}

export interface MockRegistryHandle {
  /** Base URL of the mock registry (file:// URL) */
  url: string;
  /** Tear down the mock registry directory */
  cleanup(): void;
}

/**
 * Create a temporary local registry for testing `npx termui add`.
 *
 * Writes a `schema.json` + individual component meta.json + source files
 * to a temp directory. Pass `handle.url` as the registry URL.
 *
 * @example
 * ```ts
 * const registry = mockRegistry([
 *   { name: 'spinner', category: 'feedback', files: ['Spinner.tsx'],
 *     source: { 'Spinner.tsx': 'export function Spinner() { return null; }' } }
 * ]);
 * const result = await testCLI(`node dist/cli.js add spinner`, {
 *   env: { TERMUI_REGISTRY: registry.url }
 * });
 * registry.cleanup();
 * ```
 */
export function mockRegistry(components: MockRegistryComponent[]): MockRegistryHandle {
  const dir = join(tmpdir(), `termui-mock-registry-${Date.now()}`);
  mkdirSync(dir, { recursive: true });

  // schema.json
  const schema: Record<string, unknown> = { components: {} };
  for (const comp of components) {
    const meta = {
      name: comp.name,
      description: comp.description ?? '',
      version: comp.version ?? '0.1.0',
      category: comp.category ?? 'utility',
      files: comp.files ?? [`${comp.name}.tsx`],
      deps: comp.deps ?? [],
      peerComponents: comp.peerComponents ?? [],
    };
    (schema.components as Record<string, unknown>)[comp.name] = meta;

    // Write component directory + meta.json + source files
    const compDir = join(dir, 'components', comp.name);
    mkdirSync(compDir, { recursive: true });
    writeFileSync(join(compDir, 'meta.json'), JSON.stringify(meta, null, 2));

    if (comp.source) {
      for (const [filename, content] of Object.entries(comp.source)) {
        writeFileSync(join(compDir, filename), content, 'utf-8');
      }
    }
  }

  writeFileSync(join(dir, 'schema.json'), JSON.stringify(schema, null, 2));

  return {
    url: `file://${dir}`,
    cleanup() {
      try {
        rmSync(dir, { recursive: true, force: true });
      } catch {
        // ignore cleanup errors
      }
    },
  };
}

// ─── mockFS ────────────────────────────────────────────────────────────────

export interface MockFSHandle {
  /** Root directory of the mock filesystem */
  root: string;
  /** Write a file to the mock filesystem */
  writeFile(path: string, content: string): void;
  /** Read a file from the mock filesystem */
  readFile(path: string): string | null;
  /** Check if a path exists */
  exists(path: string): boolean;
  /** Tear down the mock filesystem */
  cleanup(): void;
}

/**
 * Create a temporary filesystem sandbox for testing `termui init` / `termui add`.
 *
 * Use `handle.root` as the `cwd` for `testCLI`.
 *
 * @example
 * ```ts
 * const fs = mockFS({
 *   'package.json': JSON.stringify({ name: 'my-app', type: 'module' })
 * });
 * const result = await testCLI('node dist/cli.js init', { cwd: fs.root });
 * expect(fs.exists('termui.config.ts')).toBe(true);
 * fs.cleanup();
 * ```
 */
export function mockFS(files: Record<string, string> = {}): MockFSHandle {
  const root = join(tmpdir(), `termui-mock-fs-${Date.now()}`);
  mkdirSync(root, { recursive: true });

  // Write initial files
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = join(root, relativePath);
    mkdirSync(join(root, relativePath, '..'), { recursive: true });
    writeFileSync(fullPath, content, 'utf-8');
  }

  return {
    root,
    writeFile(path: string, content: string): void {
      const fullPath = join(root, path);
      mkdirSync(join(fullPath, '..'), { recursive: true });
      writeFileSync(fullPath, content, 'utf-8');
    },
    readFile(path: string): string | null {
      const fullPath = join(root, path);
      if (!existsSync(fullPath)) return null;
      return readFileSync(fullPath, 'utf-8');
    },
    exists(path: string): boolean {
      return existsSync(join(root, path));
    },
    cleanup() {
      try {
        rmSync(root, { recursive: true, force: true });
      } catch {
        // ignore
      }
    },
  };
}

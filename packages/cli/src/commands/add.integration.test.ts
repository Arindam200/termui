/**
 * Integration tests for `termui add`.
 *
 * These tests run the compiled CLI binary (dist/cli.js) in a subprocess via
 * testCLI. Build the CLI first with `pnpm build` inside packages/cli before
 * running this suite.
 *
 * The suite is skipped automatically when dist/cli.js is not present so that
 * CI does not fail on a clean checkout before a build step has run.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { testCLI, mockRegistry, mockFS } from '@termui/testing';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_BIN = join(__dirname, '../../dist/cli.js');
const CLI_CMD = `node ${CLI_BIN}`;

// Skip the entire suite if the binary has not been built yet.
const built = existsSync(CLI_BIN);

describe.skipIf(!built)('termui add (integration)', () => {
  it('dry-run: shows dry-run text and exits 0', async () => {
    const registry = mockRegistry([
      {
        name: 'spinner',
        category: 'feedback',
        files: ['Spinner.tsx'],
        source: { 'Spinner.tsx': 'export function Spinner() { return null; }' },
      },
    ]);

    const fs = mockFS({
      'package.json': JSON.stringify({ name: 'test-app', type: 'module' }),
      'termui.config.json': JSON.stringify({
        componentsDir: './components/ui',
        registry: registry.url,
      }),
    });

    try {
      const { output, exitCode } = await testCLI(`${CLI_CMD} add --dry-run spinner`, {
        cwd: fs.root,
      });
      expect(exitCode).toBe(0);
      expect(output.toLowerCase()).toContain('dry-run');
    } finally {
      registry.cleanup();
      fs.cleanup();
    }
  });

  it('nonexistent component: exits with code 1', async () => {
    const registry = mockRegistry([
      { name: 'spinner', category: 'feedback', files: ['Spinner.tsx'] },
    ]);

    const fs = mockFS({
      'package.json': JSON.stringify({ name: 'test-app', type: 'module' }),
      'termui.config.json': JSON.stringify({
        componentsDir: './components/ui',
        registry: registry.url,
      }),
    });

    try {
      const { exitCode } = await testCLI(`${CLI_CMD} add nonexistent-component`, {
        cwd: fs.root,
      });
      expect(exitCode).toBe(1);
    } finally {
      registry.cleanup();
      fs.cleanup();
    }
  });

  it('--recipe without a name: exits with code 1', async () => {
    const registry = mockRegistry([]);

    const fs = mockFS({
      'package.json': JSON.stringify({ name: 'test-app', type: 'module' }),
      'termui.config.json': JSON.stringify({
        componentsDir: './components/ui',
        registry: registry.url,
      }),
    });

    try {
      const { exitCode, output } = await testCLI(`${CLI_CMD} add --recipe`, {
        cwd: fs.root,
      });
      expect(exitCode).toBe(1);
      expect(output).toContain('recipe');
    } finally {
      registry.cleanup();
      fs.cleanup();
    }
  });

  it('dry-run: no files are written to disk', async () => {
    const registry = mockRegistry([
      {
        name: 'spinner',
        category: 'feedback',
        files: ['Spinner.tsx'],
        source: { 'Spinner.tsx': 'export function Spinner() { return null; }' },
      },
    ]);

    const fs = mockFS({
      'package.json': JSON.stringify({ name: 'test-app', type: 'module' }),
      'termui.config.json': JSON.stringify({
        componentsDir: './components/ui',
        registry: registry.url,
      }),
    });

    try {
      await testCLI(`${CLI_CMD} add --dry-run spinner`, {
        cwd: fs.root,
      });
      // In a dry run no component file should be written
      expect(fs.exists('components/ui/feedback/Spinner.tsx')).toBe(false);
    } finally {
      registry.cleanup();
      fs.cleanup();
    }
  });

  it('add without arguments: exits with code 1', async () => {
    const fs = mockFS({
      'package.json': JSON.stringify({ name: 'test-app', type: 'module' }),
      'termui.config.json': JSON.stringify({ componentsDir: './components/ui' }),
    });

    try {
      const { exitCode } = await testCLI(`${CLI_CMD} add`, { cwd: fs.root });
      expect(exitCode).toBe(1);
    } finally {
      fs.cleanup();
    }
  });
});

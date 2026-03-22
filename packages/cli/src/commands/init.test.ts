import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { init } from './init.js';

describe('init command', () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = join(tmpdir(), `termui-test-${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates components/ui directory', async () => {
    await init([]);
    expect(existsSync(join(tmpDir, 'components', 'ui'))).toBe(true);
  });

  it('creates termui.config.json', async () => {
    await init([]);
    expect(existsSync(join(tmpDir, 'termui.config.json'))).toBe(true);
  });

  it('creates termui.config.ts', async () => {
    await init([]);
    expect(existsSync(join(tmpDir, 'termui.config.ts'))).toBe(true);
  });
});

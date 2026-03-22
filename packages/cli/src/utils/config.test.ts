import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { readConfig, writeConfig, getConfig } from './config.js';

describe('config utils', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(tmpdir(), `termui-config-test-${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns null when no config exists', () => {
    expect(readConfig(tmpDir)).toBeNull();
  });

  it('round-trips config write and read', () => {
    const config = {
      version: '0.1.0',
      componentsDir: './components/ui',
      registry: 'https://registry.termui.dev',
      theme: 'nord',
    };
    writeConfig(config, tmpDir);
    const read = readConfig(tmpDir);
    expect(read).toEqual(config);
  });

  it('getConfig returns default when no file exists', () => {
    const config = getConfig(tmpDir);
    expect(config.theme).toBe('default');
    expect(config.componentsDir).toBe('./components/ui');
  });
});

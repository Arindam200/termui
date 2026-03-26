/**
 * Vitest/Jest custom matchers for TermUI terminal snapshots.
 *
 * @example
 * ```ts
 * import { expect } from 'vitest';
 * import { setupTerminalMatchers } from '@termui/testing';
 * setupTerminalMatchers(expect);
 *
 * const output = await renderToString(<MyComponent />);
 * expect(output).toMatchTerminalSnapshot(import.meta.url);
 * ```
 */
import { stripVolatile, normalizeAnsi, toMatchSnapshot, updateSnapshot } from './snapshot.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export interface TerminalMatchers<R = unknown> {
  toMatchTerminalSnapshot(testFilePath?: string, snapshotName?: string): R;
}

/**
 * Register custom matchers with Vitest's expect.
 */
export function setupTerminalMatchers(expect: { extend: (matchers: object) => void }): void {
  expect.extend({
    toMatchTerminalSnapshot(received: string, testFilePath?: string, snapshotName?: string) {
      const basePath = testFilePath ? dirname(fileURLToPath(testFilePath)) : process.cwd();

      const name = snapshotName ?? 'snapshot';
      const snapshotPath = join(basePath, '__snapshots__', `${name}.snap`);

      const shouldUpdate = process.env['UPDATE_SNAPSHOTS'] === '1';
      if (shouldUpdate) {
        updateSnapshot(received, snapshotPath);
        return { pass: true, message: () => `Snapshot updated at ${snapshotPath}` };
      }

      try {
        toMatchSnapshot(received, snapshotPath);
        return { pass: true, message: () => 'Snapshot matches' };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { pass: false, message: () => msg };
      }
    },
  });
}

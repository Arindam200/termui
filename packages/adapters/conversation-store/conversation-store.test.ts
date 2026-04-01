import { mkdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { createConversationStore } from './index.js';

const tempRoots: string[] = [];

function makeStoreDir(): string {
  const dir = join(tmpdir(), `termui-conversation-store-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  tempRoots.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempRoots.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe('createConversationStore', () => {
  it('rejects traversal ids on save', async () => {
    const store = createConversationStore({ dir: makeStoreDir() });

    await expect(
      store.save({
        id: '../escape',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      })
    ).rejects.toThrow(/invalid conversation id/i);
  });

  it('returns null/false for traversal ids on load and delete', async () => {
    const store = createConversationStore({ dir: makeStoreDir() });

    await expect(store.load('../escape')).resolves.toBeNull();
    await expect(store.delete('../escape')).resolves.toBe(false);
  });
});

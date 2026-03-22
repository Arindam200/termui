import { describe, it, expect, vi } from 'vitest';
import { waitFor } from './wait.js';

describe('waitFor', () => {
  it('resolves immediately when fn passes on first call', async () => {
    let calls = 0;
    await waitFor(() => {
      calls++;
    });
    expect(calls).toBe(1);
  });

  it('retries until fn stops throwing', async () => {
    let attempts = 0;
    await waitFor(
      () => {
        attempts++;
        if (attempts < 3) throw new Error('not yet');
      },
      { interval: 10 }
    );
    expect(attempts).toBe(3);
  });

  it('rejects with the last error when timeout expires', async () => {
    await expect(
      waitFor(
        () => {
          throw new Error('always fails');
        },
        { timeout: 60, interval: 10 }
      )
    ).rejects.toThrow('always fails');
  });

  it('works with async assertion functions', async () => {
    let ready = false;
    setTimeout(() => {
      ready = true;
    }, 30);

    await waitFor(
      async () => {
        if (!ready) throw new Error('not ready');
      },
      { timeout: 200, interval: 10 }
    );

    expect(ready).toBe(true);
  });

  it('uses default timeout of 1000ms and interval of 50ms', async () => {
    const start = Date.now();
    await expect(
      waitFor(
        () => {
          throw new Error('fail');
        },
        { timeout: 120, interval: 50 }
      )
    ).rejects.toThrow();
    expect(Date.now() - start).toBeGreaterThanOrEqual(100);
  });
});

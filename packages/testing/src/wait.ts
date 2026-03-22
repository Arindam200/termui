/**
 * waitFor — poll an assertion until it passes or times out.
 *
 * @example
 * ```ts
 * await waitFor(() => expect(result.rerender().output).toContain('Done'));
 * ```
 */

export interface WaitForOptions {
  /** Maximum time to wait in ms (default: 1000) */
  timeout?: number;
  /** Polling interval in ms (default: 50) */
  interval?: number;
}

/**
 * Repeatedly calls `fn` until it doesn't throw, or until timeout.
 * Useful for testing async state transitions in components.
 */
export async function waitFor(
  fn: () => void | Promise<void>,
  options: WaitForOptions = {}
): Promise<void> {
  const { timeout = 1000, interval = 50 } = options;
  const deadline = Date.now() + timeout;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      await fn();
      return; // assertion passed
    } catch (err) {
      lastError = err;
      await new Promise<void>((r) => setTimeout(r, interval));
    }
  }

  throw lastError;
}

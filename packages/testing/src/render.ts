/**
 * Headless rendering utilities for TermUI components.
 *
 * Uses Ink's render() with a mock stdout stream to capture terminal output
 * as a plain string, enabling unit testing without a real terminal.
 *
 * @example
 * ```tsx
 * import { renderToString } from '@termui/testing';
 * import { Spinner } from '@termui/components';
 *
 * const output = await renderToString(<Spinner style="dots" />);
 * expect(output).toContain('⠋'); // first frame
 * ```
 */

import React, { type ReactElement } from 'react';
import { render as inkRender, type Instance } from 'ink';
import { Writable } from 'stream';
import stripAnsi from 'strip-ansi';

export interface RenderResult {
  /** Last rendered output with ANSI codes stripped */
  output: string;
  /** Last rendered output with ANSI codes preserved */
  rawOutput: string;
  /** Re-read the current output (in case state updated) */
  rerender(): RenderResult;
  /** Unmount the component */
  unmount(): void;
  /** The underlying Ink instance */
  instance: Instance;
}

export interface TestRenderer {
  /** Render an element and return the result */
  render(element: ReactElement): RenderResult;
  /** Clean up */
  cleanup(): void;
}

/** Minimal writable stream that captures written chunks */
class CaptureStream extends Writable {
  private chunks: Buffer[] = [];

  _write(chunk: Buffer | string, _enc: BufferEncoding, cb: () => void): void {
    this.chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    cb();
  }

  get value(): string {
    return Buffer.concat(this.chunks).toString('utf8');
  }

  clear(): void {
    this.chunks = [];
  }
}

/** Build a minimal TTY-like stream Ink accepts */
function makeMockStdout(
  cols = 80,
  rows = 24
): CaptureStream & { columns: number; rows: number; isTTY: boolean } {
  const stream = new CaptureStream() as CaptureStream & {
    columns: number;
    rows: number;
    isTTY: boolean;
  };
  stream.columns = cols;
  stream.rows = rows;
  stream.isTTY = true;
  return stream;
}

function buildResult(
  stream: CaptureStream & { columns: number; rows: number; isTTY: boolean },
  instance: Instance
): RenderResult {
  const rawOutput = stream.value;
  const output = stripAnsi(rawOutput).trim();

  return {
    output,
    rawOutput,
    rerender: () => buildResult(stream, instance),
    unmount: () => instance.unmount(),
    instance,
  };
}

/**
 * Render a React element to a string synchronously (one frame).
 *
 * Use this for quick snapshot-style tests.
 */
export async function renderToString(
  element: ReactElement,
  options: { cols?: number; rows?: number; waitMs?: number } = {}
): Promise<string> {
  const { cols = 80, rows = 24, waitMs = 50 } = options;
  const stream = makeMockStdout(cols, rows);

  const instance = inkRender(element, {
    stdout: stream as unknown as NodeJS.WriteStream,
    exitOnCtrlC: false,
  });

  // Wait one tick for React to flush
  await new Promise<void>((r) => setTimeout(r, waitMs));

  const raw = stream.value;
  instance.unmount();
  return stripAnsi(raw).trim();
}

/**
 * Create a reusable test renderer. Useful when you need to interact with
 * the component across multiple assertions.
 *
 * @example
 * ```tsx
 * const { render, cleanup } = createTestRenderer();
 * const result = render(<MyComponent />);
 * expect(result.output).toContain('Hello');
 * cleanup();
 * ```
 */
export function createTestRenderer(options: { cols?: number; rows?: number } = {}): TestRenderer {
  const { cols = 80, rows = 24 } = options;
  const instances: Instance[] = [];

  return {
    render(element: ReactElement): RenderResult {
      const stream = makeMockStdout(cols, rows);
      const instance = inkRender(element, {
        stdout: stream as unknown as NodeJS.WriteStream,
        exitOnCtrlC: false,
      });
      instances.push(instance);
      return buildResult(stream, instance);
    },

    cleanup() {
      for (const inst of instances) {
        try {
          inst.unmount();
        } catch {
          /* already unmounted */
        }
      }
      instances.length = 0;
    },
  };
}

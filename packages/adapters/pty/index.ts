/**
 * termui/pty adapter — node-pty spawn helpers (optional peer).
 *
 * Requires `node-pty` to be installed for your platform.
 * See README in this folder for supported environments.
 */

import { useEffect, useRef, useState } from 'react';

/** Subset of node-pty IPty for typing without requiring native types at build time. */
export type IPty = {
  onData: (cb: (data: string) => void) => void;
  onExit: (cb: (e: { exitCode: number; signal?: number }) => void) => void;
  kill: () => void;
};

export async function spawnPty(
  file: string,
  args: string[],
  opts: { cols?: number; rows?: number; cwd?: string; env?: NodeJS.ProcessEnv }
): Promise<IPty | null> {
  try {
    const pty = await import('node-pty');
    return pty.spawn(file, args, {
      name: 'xterm-color',
      cols: opts.cols ?? 80,
      rows: opts.rows ?? 24,
      cwd: opts.cwd,
      env: opts.env ?? process.env,
    }) as IPty;
  } catch {
    return null;
  }
}

export function usePtyOutput(
  file: string,
  args: readonly string[],
  opts: { cols?: number; rows?: number; cwd?: string; maxBytes?: number }
): { text: string; error: string | null } {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const buf = useRef('');
  const argsKey = args.join('\0');

  useEffect(() => {
    let p: IPty | null = null;
    let cancelled = false;

    (async () => {
      p = await spawnPty(file, [...args], opts);
      if (cancelled) return;
      if (!p) {
        setError('node-pty is not installed or failed to load');
        return;
      }
      p.onData((d: string) => {
        buf.current += d;
        const max = opts.maxBytes ?? 500_000;
        if (buf.current.length > max) {
          buf.current = buf.current.slice(-max);
        }
        setText(buf.current);
      });
    })();

    return () => {
      cancelled = true;
      if (p) {
        p.kill();
      }
    };
  }, [file, argsKey, opts.cols, opts.rows, opts.cwd, opts.maxBytes]);

  return { text, error };
}

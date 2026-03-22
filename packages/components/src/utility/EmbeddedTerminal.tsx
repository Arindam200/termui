import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text } from 'ink';
import stripAnsi from 'strip-ansi';

export interface EmbeddedTerminalProps {
  command: string;
  args?: string[];
  cwd?: string;
  width?: number;
  height?: number;
  onExit?: (code: number) => void;
}

/**
 * Renders a pseudo-terminal session inside the TUI.
 * Requires optional dependency `node-pty` (native build).
 */
export function EmbeddedTerminal({
  command,
  args = [],
  cwd,
  width = 80,
  height = 24,
  onExit,
}: EmbeddedTerminalProps) {
  const [raw, setRaw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const argsKey = args.join('\0');

  useEffect(() => {
    let p: {
      onData: (cb: (d: string) => void) => void;
      onExit: (cb: (e: { exitCode: number }) => void) => void;
      kill: () => void;
    } | null = null;
    let cancelled = false;

    (async () => {
      try {
        const mod = await import('node-pty');
        if (cancelled) return;
        p = mod.spawn(command, args, {
          name: 'xterm-color',
          cols: width,
          rows: height,
          cwd,
        });
        p.onData((d: string) => {
          setRaw((prev) => (prev + d).slice(-500_000));
        });
        p.onExit((e) => {
          onExit?.(e.exitCode);
        });
      } catch {
        setErr('Install optional peer: node-pty (native build required for your platform).');
      }
    })();

    return () => {
      cancelled = true;
      if (p) p.kill();
    };
  }, [command, argsKey, cwd, width, height, onExit]);

  const lines = useMemo(
    () => stripAnsi(raw).split('\n').slice(-height),
    [raw, height]
  );

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" width={width}>
      {err ? (
        <Text color="red">{err}</Text>
      ) : (
        lines.map((line, i) => <Text key={i}>{line}</Text>)
      )}
    </Box>
  );
}

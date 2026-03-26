import { useState, useEffect } from 'react';

export interface TerminalSize {
  columns: number;
  rows: number;
}

/**
 * Reactively track terminal size changes.
 *
 * Returns the current `{ columns, rows }` and re-renders the component
 * whenever the terminal is resized. Updates are debounced to avoid
 * excessive re-renders during resize drags.
 *
 * @param debounceMs - Debounce delay in milliseconds (default: 50).
 * @returns `TerminalSize` — `{ columns, rows }`.
 *
 * @example
 * ```tsx
 * const { columns } = useResize();
 * return <Box width={columns - 4}><Text>Full width content</Text></Box>;
 * ```
 */
export function useResize(debounceMs = 50): TerminalSize {
  const [size, setSize] = useState<TerminalSize>({
    columns: process.stdout.columns ?? 80,
    rows: process.stdout.rows ?? 24,
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handler = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setSize({
          columns: process.stdout.columns ?? 80,
          rows: process.stdout.rows ?? 24,
        });
      }, debounceMs);
    };
    process.stdout.on('resize', handler);
    return () => {
      clearTimeout(timer);
      process.stdout.off('resize', handler);
    };
  }, [debounceMs]);

  return size;
}

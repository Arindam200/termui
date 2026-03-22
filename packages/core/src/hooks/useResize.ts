import { useState, useEffect } from 'react';

export interface TerminalSize {
  columns: number;
  rows: number;
}

/** Returns terminal dimensions, updates on resize with debounce */
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

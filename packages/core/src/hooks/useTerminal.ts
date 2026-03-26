import { useState, useEffect } from 'react';
import {
  getCapabilities,
  refreshCapabilities,
  getTerminalCapabilities,
  type TerminalCapabilities,
} from '../terminal/capabilities.js';

export interface UseTerminalResult extends TerminalCapabilities {
  /** Full cross-platform capability snapshot (same object as the hook result itself) */
  capabilities: TerminalCapabilities;
}

/**
 * Get terminal size and capabilities.
 *
 * Returns live terminal dimensions (updates on resize) and a snapshot
 * of terminal capability flags (color depth, Unicode support, etc.).
 *
 * @returns Object with `columns`, `rows`, `isTTY`, `supportsUnicode`,
 *   `supports256Color`, `supportsTrueColor`, `capabilities` (full snapshot).
 *
 * @example
 * ```tsx
 * const { columns, rows, supportsTrueColor } = useTerminal();
 * const label = columns > 80 ? 'Wide layout' : 'Narrow layout';
 * ```
 */
export function useTerminal(): UseTerminalResult {
  const [caps, setCaps] = useState<TerminalCapabilities>(getCapabilities);

  useEffect(() => {
    const handler = () => {
      setCaps(refreshCapabilities());
    };
    process.stdout.on('resize', handler);
    return () => {
      process.stdout.off('resize', handler);
    };
  }, []);

  const capabilities = getTerminalCapabilities();

  return {
    ...caps,
    capabilities,
  };
}

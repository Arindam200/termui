import { useState, useEffect } from 'react';
import {
  getCapabilities,
  refreshCapabilities,
  type TerminalCapabilities,
} from '../terminal/capabilities.js';

/** Returns current terminal capabilities, updates on resize */
export function useTerminal(): TerminalCapabilities {
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

  return caps;
}

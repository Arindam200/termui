/**
 * termui/link — OSC 8 hyperlinks (terminal-link–style API).
 */

import { isColorEnabled } from '../internal/color-env.js';

export function terminalLink(text: string, url: string): string {
  if (!isColorEnabled()) {
    return `${text} (${url})`;
  }
  return `\x1b]8;;${url}\x1b\\${text}\x1b]8;;\x1b\\`;
}

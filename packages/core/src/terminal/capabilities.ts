/**
 * Terminal capability detection.
 * Detects: color depth, unicode support, mouse support, true-color.
 */

export type ColorDepth = 1 | 4 | 8 | 24; // 1=mono, 4=16-color, 8=256-color, 24=true-color

export interface TerminalCapabilities {
  colorDepth: ColorDepth;
  supportsUnicode: boolean;
  supportsTrueColor: boolean;
  supports256Color: boolean;
  supportsMouse: boolean;
  columns: number;
  rows: number;
  isTTY: boolean;
}

/** Detect current terminal capabilities from process environment */
export function detectCapabilities(): TerminalCapabilities {
  const isTTY = Boolean(process.stdout.isTTY);
  const columns = process.stdout.columns ?? 80;
  const rows = process.stdout.rows ?? 24;

  // NO_COLOR / FORCE_COLOR env vars
  const noColor = 'NO_COLOR' in process.env;
  const forceColor = process.env['FORCE_COLOR'];

  // Color depth detection
  let colorDepth: ColorDepth = 1;

  if (!noColor) {
    if (forceColor === '3' || forceColor === 'true' || forceColor === '1') {
      colorDepth = 24;
    } else if (forceColor === '2') {
      colorDepth = 8;
    } else if (isTTY) {
      // Check COLORTERM env for true-color
      const colorterm = (process.env['COLORTERM'] ?? '').toLowerCase();
      if (colorterm === 'truecolor' || colorterm === '24bit') {
        colorDepth = 24;
      } else if (
        (process.env['TERM_PROGRAM'] ?? '').toLowerCase().includes('iterm') ||
        (process.env['TERM_PROGRAM'] ?? '').toLowerCase() === 'hyper'
      ) {
        colorDepth = 24;
      } else if ((process.env['TERM'] ?? '').includes('256color')) {
        colorDepth = 8;
      } else if (process.env['TERM'] === 'xterm' || isTTY) {
        colorDepth = 4;
      }
    }
  }

  const supportsTrueColor = colorDepth === 24;
  const supports256Color = colorDepth >= 8;

  // Unicode detection
  const lang = process.env['LANG'] ?? process.env['LC_ALL'] ?? '';
  const supportsUnicode =
    lang.toLowerCase().includes('utf-8') ||
    lang.toLowerCase().includes('utf8') ||
    process.platform === 'darwin' ||
    (process.env['TERM_PROGRAM'] ?? '') !== '';

  // Mouse support (most modern terminals support xterm mouse protocol)
  const supportsMouse = isTTY;

  return {
    colorDepth,
    supportsUnicode,
    supportsTrueColor,
    supports256Color,
    supportsMouse,
    columns,
    rows,
    isTTY,
  };
}

/** Singleton instance for the current terminal session */
let _capabilities: TerminalCapabilities | null = null;

export function getCapabilities(): TerminalCapabilities {
  if (!_capabilities) {
    _capabilities = detectCapabilities();
  }
  return _capabilities;
}

/** Force re-detect capabilities (useful after SIGWINCH) */
export function refreshCapabilities(): TerminalCapabilities {
  _capabilities = detectCapabilities();
  return _capabilities;
}

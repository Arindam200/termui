/**
 * Terminal capability detection — platform-aware feature flags.
 *
 * Detects Windows Terminal, ConPTY, VS Code terminal, WSL, Git Bash,
 * and falls back gracefully for each capability.
 */

export interface TerminalCapabilities {
  /** Operating system platform */
  platform: NodeJS.Platform;
  /** Detected terminal emulator name */
  terminal: string;
  /** Whether the terminal supports Unicode/box-drawing characters */
  supportsUnicode: boolean;
  /** Whether 256-color ANSI is supported */
  supports256Color: boolean;
  /** Whether 24-bit true-color is supported */
  supportsTrueColor: boolean;
  /** Whether mouse events (click/scroll/drag) are supported */
  supportsMouseEvents: boolean;
  /** Whether OSC 8 hyperlinks are supported */
  supportsHyperlinks: boolean;
  /** Windows: whether ConPTY (modern virtual terminal) is active */
  supportsConPTY: boolean;
  /** Whether the terminal is running inside WSL */
  isWSL: boolean;
  /** Whether running inside VS Code integrated terminal */
  isVSCode: boolean;
  /** Whether running inside Windows Terminal */
  isWindowsTerminal: boolean;
  /** Whether running inside tmux or screen */
  isMultiplexer: boolean;
  /** Whether running in a CI/CD environment */
  isCI: boolean;
  /** Terminal column width */
  columns: number;
  /** Terminal row height */
  rows: number;
  /** Whether stdout is a TTY */
  isTTY: boolean;
}

function detectTerminalName(): string {
  const { env } = process;
  if (env['WT_SESSION']) return 'windows-terminal';
  if (env['TERM_PROGRAM'] === 'vscode') return 'vscode';
  if (env['TERM_PROGRAM'] === 'iTerm.app') return 'iterm2';
  if (env['TERM_PROGRAM'] === 'Hyper') return 'hyper';
  if (env['TERM_PROGRAM'] === 'Apple_Terminal') return 'apple-terminal';
  if (env['TMUX']) return 'tmux';
  if (env['TERM']?.includes('screen')) return 'screen';
  if (env['TERM'] === 'xterm-kitty') return 'kitty';
  if (env['ALACRITTY_LOG'] || env['ALACRITTY_SOCKET']) return 'alacritty';
  if (env['WEZTERM_EXECUTABLE']) return 'wezterm';
  if (env['MSYSTEM']) return 'msys2-git-bash';
  if (process.platform === 'win32') return 'windows-console';
  return env['TERM'] ?? 'unknown';
}

function detectUnicodeSupport(): boolean {
  const { env, platform } = process;
  // NO_UNICODE=1 forces ASCII mode globally
  if (env['NO_UNICODE'] === '1' || env['NO_UNICODE'] === 'true') return false;
  // WSL always supports Unicode
  if (env['WSL_DISTRO_NAME']) return true;
  // Windows Terminal supports Unicode
  if (env['WT_SESSION']) return true;
  // VS Code terminal supports Unicode
  if (env['TERM_PROGRAM'] === 'vscode') return true;
  // MSYS2/Git Bash: partial support
  if (env['MSYSTEM']) return false;
  // Classic Windows cmd.exe: no Unicode box-drawing
  if (platform === 'win32' && !env['WT_SESSION'] && !env['TERM']) return false;
  // macOS and Linux: Unicode supported
  if (platform === 'darwin' || platform === 'linux') return true;
  return true;
}

function detectColorSupport(): { color256: boolean; trueColor: boolean } {
  const { env } = process;

  if (env['NO_COLOR']) return { color256: false, trueColor: false };

  const forceColor = env['FORCE_COLOR'];
  if (forceColor === '3' || forceColor === 'true') return { color256: true, trueColor: true };
  if (forceColor === '2') return { color256: true, trueColor: false };
  if (forceColor === '1') return { color256: false, trueColor: false };

  const term = env['TERM'] ?? '';
  const colorTerm = env['COLORTERM'] ?? '';

  const trueColor =
    colorTerm === 'truecolor' ||
    colorTerm === '24bit' ||
    !!env['WT_SESSION'] ||
    env['TERM_PROGRAM'] === 'vscode' ||
    env['TERM_PROGRAM'] === 'iTerm.app';

  const color256 = trueColor || term.includes('256color') || term.includes('xterm');

  return { color256, trueColor };
}

/**
 * Get terminal capabilities. Cached after first call.
 */
let cached: TerminalCapabilities | null = null;

export function getTerminalCapabilities(): TerminalCapabilities {
  if (cached) return cached;

  const { env, platform } = process;
  const { color256, trueColor } = detectColorSupport();

  cached = {
    platform,
    terminal: detectTerminalName(),
    supportsUnicode: detectUnicodeSupport(),
    supports256Color: color256,
    supportsTrueColor: trueColor,
    supportsMouseEvents: !!(env['TERM'] && !env['NO_COLOR']),
    supportsHyperlinks:
      !!env['WT_SESSION'] ||
      env['TERM_PROGRAM'] === 'vscode' ||
      env['TERM_PROGRAM'] === 'iTerm.app' ||
      env['TERM'] === 'xterm-kitty',
    supportsConPTY: platform === 'win32' && !!env['WT_SESSION'],
    isWSL: !!env['WSL_DISTRO_NAME'],
    isVSCode: env['TERM_PROGRAM'] === 'vscode',
    isWindowsTerminal: !!env['WT_SESSION'],
    isMultiplexer: !!env['TMUX'] || (env['TERM']?.includes('screen') ?? false),
    isCI: !!env['CI'],
    columns: process.stdout.columns ?? 80,
    rows: process.stdout.rows ?? 24,
    isTTY: Boolean(process.stdout.isTTY),
  };

  // On Windows: attempt to enable virtual terminal processing
  if (platform === 'win32') {
    enableWindowsVT();
  }

  return cached;
}

function enableWindowsVT(): void {
  try {
    // Attempt to enable ANSI virtual terminal via SetConsoleMode
    // This requires the 'ffi-napi' or 'koffi' package to call Win32 API.
    // As a fallback, we just set the TERM variable.
    if (!process.env['TERM']) {
      process.env['TERM'] = 'xterm-256color';
    }
  } catch {
    // If kernel32 is not available, proceed without VT processing
  }
}

/**
 * Reset the capabilities cache (useful in tests).
 */
export function resetCapabilitiesCache(): void {
  cached = null;
}

// ---------------------------------------------------------------------------
// Legacy aliases — kept for backwards compatibility with existing consumers
// that import getCapabilities / refreshCapabilities from this module.
// ---------------------------------------------------------------------------

/** @deprecated Use getTerminalCapabilities() instead */
export function getCapabilities(): TerminalCapabilities {
  return getTerminalCapabilities();
}

/** @deprecated Use resetCapabilitiesCache() then getTerminalCapabilities() instead */
export function refreshCapabilities(): TerminalCapabilities {
  resetCapabilitiesCache();
  return getTerminalCapabilities();
}

/** @deprecated Use getTerminalCapabilities() instead */
export function detectCapabilities(): TerminalCapabilities {
  return getTerminalCapabilities();
}

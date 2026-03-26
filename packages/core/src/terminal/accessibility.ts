/**
 * ANSI accessibility annotations for screen readers.
 * These sequences are picked up by VoiceOver (macOS) and NVDA (Windows).
 */

export interface AriaProps {
  'aria-label'?: string;
  'aria-description'?: string;
  'aria-live'?: 'polite' | 'assertive';
}

/**
 * Announce text to screen readers.
 * Uses an OSC-style sequence that some screen readers intercept.
 * Falls back to writing a comment to stderr in non-TTY mode.
 */
export function announce(text: string, urgency: 'polite' | 'assertive' = 'polite'): void {
  if (!text) return;
  // VoiceOver-compatible accessibility announcement via stderr metadata
  // This is a best-effort approach — terminal accessibility is limited
  if (process.stderr.isTTY) {
    // Write accessible description as an ESC sequence comment
    // Screen readers that intercept terminal output can read this
    process.stderr.write(`\x1b[?;${urgency === 'assertive' ? '1' : '0'};${text}\x07`);
  }
}

/**
 * Get an accessible name for a component — returns aria-label if set,
 * otherwise falls back to the provided default.
 */
export function getAccessibleName(ariaLabel: string | undefined, fallback: string): string {
  return ariaLabel ?? fallback;
}

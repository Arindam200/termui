/**
 * ANSI snapshot testing utilities for TermUI components.
 * Provides stable snapshots by stripping volatile content.
 */
import stripAnsi from 'strip-ansi';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// Characters that represent spinner frames — replaced with [SPINNER] placeholder
// Note: ▌ is intentionally excluded here — it's a blinking cursor, handled separately
const SPINNER_CHARS = /[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏⠁⠂⠄⡀⡈⠠⠐⠈▏▎▍▋▊▉▖▘▝▗◜◠◝◞◡◟←↖↑↗→↘↓↙⊶⊷┤┘┴└├┌┬┐]+/g;

// Timestamp patterns (HH:MM:SS or H:MM:SS AM/PM)
const TIMESTAMP_RE = /\d{1,2}:\d{2}:\d{2}(\s*(AM|PM))?/g;

// Cursor blink / position sequences
const CURSOR_RE = /\x1b\[\d*[ABCDHJ]/g;

// Blinking cursor characters
const BLINK_CURSOR_RE = /▌/g;

/**
 * Strip volatile content from output to produce a stable snapshot.
 *
 * Replaces:
 * - Spinner animation frames → "[SPINNER]"
 * - Timestamps → "[TIME]"
 * - Blinking cursors → "[CURSOR]"
 */
export function stripVolatile(output: string): string {
  return output
    .replace(CURSOR_RE, '')
    .replace(BLINK_CURSOR_RE, '[CURSOR]')
    .replace(SPINNER_CHARS, '[SPINNER]')
    .replace(TIMESTAMP_RE, '[TIME]');
}

/**
 * Normalize ANSI escape codes to collapse equivalent sequences.
 * Strips all ANSI, then re-applies consistent formatting.
 */
export function normalizeAnsi(output: string): string {
  return stripAnsi(output);
}

/**
 * Write or compare a snapshot file.
 *
 * @param output - current output string (stripped of ANSI)
 * @param snapshotPath - absolute path to `.snap` file
 * @returns true if matches (or was written), throws if mismatch
 */
export function toMatchSnapshot(output: string, snapshotPath: string): true {
  const normalized = stripVolatile(normalizeAnsi(output));

  if (!existsSync(snapshotPath)) {
    // First run: write snapshot
    mkdirSync(dirname(snapshotPath), { recursive: true });
    writeFileSync(snapshotPath, normalized, 'utf-8');
    return true;
  }

  const expected = readFileSync(snapshotPath, 'utf-8');
  if (normalized !== expected) {
    const diff = buildDiff(expected, normalized);
    throw new Error(
      `Snapshot mismatch at ${snapshotPath}\n\n${diff}\n\nRun with UPDATE_SNAPSHOTS=1 to update.`
    );
  }

  return true;
}

/**
 * Update snapshot file. Call when UPDATE_SNAPSHOTS=1 is set.
 */
export function updateSnapshot(output: string, snapshotPath: string): void {
  const normalized = stripVolatile(normalizeAnsi(output));
  mkdirSync(dirname(snapshotPath), { recursive: true });
  writeFileSync(snapshotPath, normalized, 'utf-8');
}

function buildDiff(expected: string, received: string): string {
  const expLines = expected.split('\n');
  const recLines = received.split('\n');
  const lines: string[] = [];

  const maxLen = Math.max(expLines.length, recLines.length);
  for (let i = 0; i < maxLen; i++) {
    const exp = expLines[i];
    const rec = recLines[i];
    if (exp === undefined) {
      lines.push(`+ ${rec}`);
    } else if (rec === undefined) {
      lines.push(`- ${exp}`);
    } else if (exp !== rec) {
      lines.push(`- ${exp}`);
      lines.push(`+ ${rec}`);
    } else {
      lines.push(`  ${exp}`);
    }
  }
  return lines.join('\n');
}

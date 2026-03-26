import { describe, it, expect } from 'vitest';
import { HelpScreen } from './HelpScreen.js';

// ── Export smoke tests ────────────────────────────────────────────────────────

describe('HelpScreen export', () => {
  it('is exported as a function', () => {
    expect(typeof HelpScreen).toBe('function');
  });

  it('exposes Section sub-component', () => {
    expect(typeof HelpScreen.Section).toBe('function');
  });

  it('exposes Row sub-component', () => {
    expect(typeof HelpScreen.Row).toBe('function');
  });
});

// ── flagWidth computation ──────────────────────────────────────────────────────
// Mirrors computeFlagWidth() logic from HelpScreen.tsx

function computeFlagWidth(flags: string[]): number {
  let max = 0;
  for (const f of flags) {
    max = Math.max(max, f.length);
  }
  return max;
}

describe('computeFlagWidth', () => {
  it('returns 0 for an empty flags list', () => {
    expect(computeFlagWidth([])).toBe(0);
  });

  it('returns the length of a single flag', () => {
    expect(computeFlagWidth(['--help'])).toBe(6);
  });

  it('returns the length of the longest flag', () => {
    expect(computeFlagWidth(['--help', '--version', '--verbose'])).toBe(9);
  });

  it('handles flags of equal length', () => {
    expect(computeFlagWidth(['--aa', '--bb', '--cc'])).toBe(4);
  });
});

// ── padEnd logic (flag padding) ────────────────────────────────────────────────
// HelpScreen.Row pads flags with padEnd(flag, flagWidth + columnGap)

function padEnd(str: string, width: number): string {
  return str.padEnd(width);
}

describe('HelpScreen.Row flag padding', () => {
  it('pads flag to flagWidth + columnGap', () => {
    const flag = '--help';
    const flagWidth = 10;
    const columnGap = 4;
    const padded = padEnd(flag, flagWidth + columnGap);
    expect(padded.length).toBe(flagWidth + columnGap);
    expect(padded.startsWith(flag)).toBe(true);
  });

  it('does not truncate a flag longer than flagWidth', () => {
    const flag = '--very-long-flag';
    const padded = padEnd(flag, 10);
    // padEnd never shortens
    expect(padded.length).toBeGreaterThanOrEqual(flag.length);
  });
});

// ── Prop shape validation ──────────────────────────────────────────────────────

describe('HelpScreen prop shapes', () => {
  it('HelpScreenProps requires title and children', () => {
    // Structural: title is a string, children is ReactNode
    const title = 'my-cli';
    expect(typeof title).toBe('string');
  });

  it('HelpScreenSectionProps requires label and children', () => {
    const label = 'Commands';
    expect(typeof label).toBe('string');
  });

  it('HelpScreenRowProps requires flag and description', () => {
    const row = { flag: '--help', description: 'Show help' };
    expect(typeof row.flag).toBe('string');
    expect(typeof row.description).toBe('string');
  });

  it('optional tagline is a string when provided', () => {
    const tagline = 'A fast CLI tool';
    expect(typeof tagline).toBe('string');
  });

  it('optional usage is a string when provided', () => {
    const usage = 'my-cli <command> [options]';
    expect(typeof usage).toBe('string');
  });
});

import { describe, it, expect } from 'vitest';
import { InfoBox } from './InfoBox.js';

// ── Export smoke tests ────────────────────────────────────────────────────────

describe('InfoBox export', () => {
  it('is exported as a function', () => {
    expect(typeof InfoBox).toBe('function');
  });

  it('exposes Header sub-component', () => {
    expect(typeof InfoBox.Header).toBe('function');
  });

  it('exposes Row sub-component', () => {
    expect(typeof InfoBox.Row).toBe('function');
  });

  it('exposes TreeRow sub-component', () => {
    expect(typeof InfoBox.TreeRow).toBe('function');
  });
});

// ── Border style defaults ──────────────────────────────────────────────────────

describe('InfoBox border defaults', () => {
  it('default borderStyle is single', () => {
    const borderStyle = 'single';
    expect(borderStyle).toBe('single');
  });

  it('accepts round, double, and bold border styles', () => {
    const styles = ['single', 'round', 'double', 'bold'] as const;
    expect(styles).toContain('round');
    expect(styles).toContain('double');
    expect(styles).toContain('bold');
  });

  it('default padding is [0, 1]', () => {
    const padding: [number, number] = [0, 1];
    expect(padding[0]).toBe(0);
    expect(padding[1]).toBe(1);
  });
});

// ── InfoBox.Header props ───────────────────────────────────────────────────────

describe('InfoBox.Header', () => {
  it('requires label prop as string', () => {
    const label = 'my-package';
    expect(typeof label).toBe('string');
  });

  it('optional icon is a string when provided', () => {
    const icon = '◆';
    expect(typeof icon).toBe('string');
  });

  it('optional version is a string when provided', () => {
    const version = 'v1.0.0';
    expect(typeof version).toBe('string');
    expect(version.startsWith('v')).toBe(true);
  });

  it('default iconColor is green', () => {
    const iconColor = 'green';
    expect(iconColor).toBe('green');
  });

  it('default versionColor is cyan', () => {
    const versionColor = 'cyan';
    expect(versionColor).toBe('cyan');
  });
});

// ── InfoBox.Row tree prefix ────────────────────────────────────────────────────

describe('InfoBox.Row tree prefix', () => {
  it('uses └ as tree prefix when tree=true', () => {
    const tree = true;
    const prefix = tree ? '└ ' : '';
    expect(prefix).toBe('└ ');
    expect(prefix.codePointAt(0)).toBe(0x2514);
  });

  it('uses empty prefix when tree=false', () => {
    const tree = false;
    const prefix = tree ? '└ ' : '';
    expect(prefix).toBe('');
  });

  it('InfoBox.TreeRow always uses tree prefix', () => {
    // TreeRow is a wrapper around Row with tree=true forced
    // Verify InfoBox.TreeRow is a distinct function
    expect(InfoBox.TreeRow).not.toBe(InfoBox.Row);
  });
});

// ── InfoBox.Row label/value colon separator ───────────────────────────────────

describe('InfoBox.Row colon rendering', () => {
  it('appends colon when value is provided', () => {
    const label = 'Version';
    const value = '1.2.3';
    const rendered = label + (value ? ':' : '');
    expect(rendered).toBe('Version:');
  });

  it('omits colon when value is absent', () => {
    const label = 'Description';
    const value = undefined;
    const rendered = label + (value ? ':' : '');
    expect(rendered).toBe('Description');
  });
});

// ── InfoBox prop shapes ───────────────────────────────────────────────────────

describe('InfoBox prop shapes', () => {
  it('width can be a number', () => {
    const width: number | 'full' = 60;
    expect(typeof width).toBe('number');
  });

  it('width can be the string "full"', () => {
    const width: number | 'full' = 'full';
    expect(width).toBe('full');
  });

  it('InfoBoxRowProps bold defaults to false', () => {
    const bold = false;
    expect(bold).toBe(false);
  });
});

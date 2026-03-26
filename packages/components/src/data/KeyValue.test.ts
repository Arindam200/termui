import { describe, it, expect } from 'vitest';
import { KeyValue } from './KeyValue.js';

// ── Export smoke test ──────────────────────────────────────────────────────

describe('KeyValue export', () => {
  it('is exported as a function', () => {
    expect(typeof KeyValue).toBe('function');
  });
});

// ── Key width calculation ──────────────────────────────────────────────────
// Mirrors the `resolvedKeyWidth` useMemo in KeyValue.tsx:
//   items.reduce((max, item) => Math.max(max, item.key.length), 0) + 1

interface KeyValueItem {
  key: string;
  value: unknown;
  color?: string;
}

function resolveKeyWidth(items: KeyValueItem[], keyWidth?: number): number {
  if (keyWidth !== undefined) return keyWidth;
  return items.reduce((max, item) => Math.max(max, item.key.length), 0) + 1;
}

describe('KeyValue key width alignment', () => {
  it('auto-calculates width from the longest key plus 1', () => {
    const items: KeyValueItem[] = [
      { key: 'Name', value: 'Alice' },
      { key: 'Version', value: '1.0.0' },
      { key: 'OS', value: 'Linux' },
    ];
    // longest = 'Version' (7) + 1 = 8
    expect(resolveKeyWidth(items)).toBe(8);
  });

  it('uses the explicit keyWidth when provided', () => {
    const items: KeyValueItem[] = [{ key: 'Name', value: 'Alice' }];
    expect(resolveKeyWidth(items, 20)).toBe(20);
  });

  it('returns 1 for an empty items array (0 + 1)', () => {
    expect(resolveKeyWidth([])).toBe(1);
  });

  it('all keys same length: width equals that length + 1', () => {
    const items: KeyValueItem[] = [
      { key: 'aaa', value: 1 },
      { key: 'bbb', value: 2 },
    ];
    expect(resolveKeyWidth(items)).toBe(4);
  });
});

// ── Key padding ────────────────────────────────────────────────────────────
// Mirrors `item.key.padEnd(resolvedKeyWidth, ' ')`

function padKey(key: string, width: number): string {
  return key.padEnd(width, ' ');
}

describe('KeyValue key padding', () => {
  it('pads a short key to the resolved width', () => {
    expect(padKey('OS', 8)).toBe('OS      ');
  });

  it('does not truncate a key equal to the width', () => {
    expect(padKey('Version', 7)).toBe('Version');
  });

  it('aligns all keys to the same visual column', () => {
    const keys = ['Name', 'Version', 'OS'];
    const width = 8;
    const padded = keys.map((k) => padKey(k, width));
    const lengths = padded.map((p) => p.length);
    expect(new Set(lengths).size).toBe(1);
  });
});

// ── Key-value pair rendering ───────────────────────────────────────────────
// Simulates building the text line that would appear in the component

function buildLine(item: KeyValueItem, keyWidth: number, separator = ':'): string {
  return `${item.key.padEnd(keyWidth, ' ')} ${separator} ${String(item.value)}`;
}

describe('KeyValue pair rendering', () => {
  it('renders key and value in a single line', () => {
    const line = buildLine({ key: 'Name', value: 'Alice' }, 5);
    expect(line).toContain('Name');
    expect(line).toContain('Alice');
  });

  it('uses custom separator', () => {
    const line = buildLine({ key: 'ENV', value: 'prod' }, 4, '=');
    expect(line).toContain('=');
    expect(line).not.toContain(':');
  });

  it('renders multiple pairs independently', () => {
    const items: KeyValueItem[] = [
      { key: 'Host', value: 'localhost' },
      { key: 'Port', value: 3000 },
    ];
    const width = resolveKeyWidth(items);
    const lines = items.map((item) => buildLine(item, width));
    expect(lines[0]).toContain('localhost');
    expect(lines[1]).toContain('3000');
  });
});

// ── Optional / falsy values ────────────────────────────────────────────────

describe('KeyValue optional values', () => {
  it('renders empty string value without error', () => {
    const line = buildLine({ key: 'Token', value: '' }, 6);
    expect(line).toContain('Token');
  });

  it('renders numeric zero value', () => {
    const line = buildLine({ key: 'Count', value: 0 }, 6);
    expect(line).toContain('0');
  });

  it('renders undefined value as "undefined" string', () => {
    const line = buildLine({ key: 'Missing', value: undefined }, 8);
    expect(line).toContain('undefined');
  });

  it('renders null value as "null" string', () => {
    const line = buildLine({ key: 'Null', value: null }, 5);
    expect(line).toContain('null');
  });
});

// ── Color resolution ───────────────────────────────────────────────────────
// Mirrors `item.color ?? resolvedValueColor`

function resolveItemColor(itemColor?: string, valueColor?: string): string | undefined {
  return itemColor ?? valueColor;
}

describe('KeyValue color resolution', () => {
  it('uses item-level color when provided', () => {
    expect(resolveItemColor('red', 'gray')).toBe('red');
  });

  it('falls back to global valueColor when item has no color', () => {
    expect(resolveItemColor(undefined, 'gray')).toBe('gray');
  });

  it('returns undefined when neither color is set', () => {
    expect(resolveItemColor(undefined, undefined)).toBeUndefined();
  });
});

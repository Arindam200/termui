import { describe, it, expect } from 'vitest';

function pad(str: string, width: number, align: 'left' | 'right' | 'center' = 'left'): string {
  const s = String(str);
  if (s.length >= width) return s.slice(0, width);
  const diff = width - s.length;
  if (align === 'right') return ' '.repeat(diff) + s;
  if (align === 'center') {
    const left = Math.floor(diff / 2);
    const right = diff - left;
    return ' '.repeat(left) + s + ' '.repeat(right);
  }
  return s + ' '.repeat(diff);
}

describe('Table pad utility', () => {
  it('pads left (default)', () => {
    expect(pad('hi', 5)).toBe('hi   ');
  });
  it('pads right', () => {
    expect(pad('hi', 5, 'right')).toBe('   hi');
  });
  it('pads center', () => {
    expect(pad('hi', 6, 'center')).toBe('  hi  ');
  });
  it('truncates when too long', () => {
    expect(pad('hello world', 5)).toBe('hello');
  });
});

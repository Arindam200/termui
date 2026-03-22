import { describe, it, expect } from 'vitest';
import { style } from './style.js';

describe('StyleBuilder', () => {
  it('returns plain text when no styles applied', () => {
    // build() with no codes returns the original text
    const result = style('hello').build();
    expect(result).toBe('hello');
  });

  it('applies bold', () => {
    const result = style('hello').bold().build();
    expect(result).toContain('\x1b[1m');
    expect(result).toContain('hello');
    expect(result).toContain('\x1b[0m');
  });

  it('applies fg color', () => {
    const result = style('hello').fg('#FF0000').build();
    expect(result).toContain('\x1b[38;2;255;0;0m');
    expect(result).toContain('hello');
  });

  it('chains multiple styles', () => {
    const result = style('hi').bold().dim().build();
    expect(result).toContain('\x1b[1m');
    expect(result).toContain('\x1b[2m');
    expect(result).toContain('hi');
  });

  it('toString() equals build()', () => {
    const b = style('test').bold();
    expect(b.toString()).toBe(b.build());
  });
});

import { describe, it, expect } from 'vitest';
import { Popover } from './Popover.js';

describe('Popover export', () => {
  it('is exported as a function', () => {
    expect(typeof Popover).toBe('function');
  });
});

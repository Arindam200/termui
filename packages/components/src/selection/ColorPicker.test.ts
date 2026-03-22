import { describe, it, expect } from 'vitest';
import { ColorPicker } from './ColorPicker.js';

describe('ColorPicker export', () => {
  it('is exported as a function', () => {
    expect(typeof ColorPicker).toBe('function');
  });
});

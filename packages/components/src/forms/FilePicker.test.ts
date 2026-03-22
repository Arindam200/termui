import { describe, it, expect } from 'vitest';
import { FilePicker } from './FilePicker.js';

describe('FilePicker export', () => {
  it('is exported as a function', () => {
    expect(typeof FilePicker).toBe('function');
  });
});

import { describe, it, expect } from 'vitest';
import { FormField } from './FormField.js';

describe('FormField export', () => {
  it('is exported as a function', () => {
    expect(typeof FormField).toBe('function');
  });
});

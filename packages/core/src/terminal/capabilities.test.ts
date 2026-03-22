import { describe, it, expect } from 'vitest';
import { detectCapabilities } from './capabilities.js';

describe('Terminal capability detection', () => {
  it('returns a valid capabilities object', () => {
    const caps = detectCapabilities();
    expect(caps).toHaveProperty('colorDepth');
    expect(caps).toHaveProperty('supportsUnicode');
    expect(caps).toHaveProperty('columns');
    expect(caps).toHaveProperty('rows');
    expect(caps).toHaveProperty('isTTY');
    expect([1, 4, 8, 24]).toContain(caps.colorDepth);
  });
});

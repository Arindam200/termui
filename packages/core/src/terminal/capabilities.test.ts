import { describe, it, expect, beforeEach } from 'vitest';
import { getTerminalCapabilities, resetCapabilitiesCache } from './capabilities.js';

describe('Terminal capability detection', () => {
  beforeEach(() => {
    resetCapabilitiesCache();
  });

  it('returns a valid capabilities object', () => {
    const caps = getTerminalCapabilities();
    expect(caps).toHaveProperty('platform');
    expect(caps).toHaveProperty('terminal');
    expect(caps).toHaveProperty('supportsUnicode');
    expect(caps).toHaveProperty('supports256Color');
    expect(caps).toHaveProperty('supportsTrueColor');
    expect(caps).toHaveProperty('supportsMouseEvents');
    expect(caps).toHaveProperty('supportsHyperlinks');
    expect(caps).toHaveProperty('supportsConPTY');
    expect(caps).toHaveProperty('isWSL');
    expect(caps).toHaveProperty('isVSCode');
    expect(caps).toHaveProperty('isWindowsTerminal');
    expect(caps).toHaveProperty('isMultiplexer');
    expect(caps).toHaveProperty('isCI');
    expect(caps).toHaveProperty('columns');
    expect(caps).toHaveProperty('rows');
    expect(caps).toHaveProperty('isTTY');
  });

  it('returns boolean values for flag fields', () => {
    const caps = getTerminalCapabilities();
    expect(typeof caps.supportsUnicode).toBe('boolean');
    expect(typeof caps.supports256Color).toBe('boolean');
    expect(typeof caps.supportsTrueColor).toBe('boolean');
    expect(typeof caps.supportsMouseEvents).toBe('boolean');
    expect(typeof caps.isWSL).toBe('boolean');
    expect(typeof caps.isCI).toBe('boolean');
  });

  it('returns numeric column and row values', () => {
    const caps = getTerminalCapabilities();
    expect(typeof caps.columns).toBe('number');
    expect(typeof caps.rows).toBe('number');
    expect(caps.columns).toBeGreaterThan(0);
    expect(caps.rows).toBeGreaterThan(0);
  });

  it('caches results across calls', () => {
    const caps1 = getTerminalCapabilities();
    const caps2 = getTerminalCapabilities();
    expect(caps1).toBe(caps2);
  });

  it('returns a fresh object after cache reset', () => {
    const caps1 = getTerminalCapabilities();
    resetCapabilitiesCache();
    const caps2 = getTerminalCapabilities();
    expect(caps1).not.toBe(caps2);
  });
});

import { describe, it, expect } from 'vitest';
import { getLocalRegistry } from './client.js';

describe('local registry', () => {
  it('returns a valid manifest', () => {
    const manifest = getLocalRegistry();
    expect(manifest.version).toBe('0.1.0');
    expect(typeof manifest.components).toBe('object');
  });

  it('contains spinner component', () => {
    const manifest = getLocalRegistry();
    expect(manifest.components['spinner']).toBeDefined();
    expect(manifest.components['spinner']?.category).toBe('feedback');
  });

  it('contains all 19 MVP components', () => {
    const manifest = getLocalRegistry();
    const count = Object.keys(manifest.components).length;
    expect(count).toBeGreaterThanOrEqual(15);
  });

  it('each component has required fields', () => {
    const manifest = getLocalRegistry();
    for (const [name, comp] of Object.entries(manifest.components)) {
      expect(comp.name, `${name}.name`).toBe(name);
      expect(comp.description, `${name}.description`).toBeTruthy();
      expect(comp.category, `${name}.category`).toBeTruthy();
      expect(Array.isArray(comp.files), `${name}.files`).toBe(true);
    }
  });
});

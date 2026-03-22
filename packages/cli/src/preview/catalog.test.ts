import { describe, it, expect } from 'vitest';
import { CATALOG, totalComponents } from './catalog.js';

describe('CATALOG', () => {
  it('has at least 9 categories', () => {
    expect(CATALOG.length).toBeGreaterThanOrEqual(9);
  });

  it('each category has a name and at least one component', () => {
    for (const cat of CATALOG) {
      expect(typeof cat.name).toBe('string');
      expect(cat.components.length).toBeGreaterThan(0);
    }
  });

  it('every component has name, description, props array, and usage string', () => {
    for (const cat of CATALOG) {
      for (const comp of cat.components) {
        expect(typeof comp.name).toBe('string');
        expect(typeof comp.description).toBe('string');
        expect(Array.isArray(comp.props)).toBe(true);
        expect(typeof comp.usage).toBe('string');
      }
    }
  });

  it('every prop has name and type fields', () => {
    for (const cat of CATALOG) {
      for (const comp of cat.components) {
        for (const prop of comp.props) {
          expect(typeof prop.name).toBe('string');
          expect(typeof prop.type).toBe('string');
        }
      }
    }
  });
});

describe('totalComponents', () => {
  it('returns the sum of all components across categories', () => {
    const expected = CATALOG.reduce((sum, cat) => sum + cat.components.length, 0);
    expect(totalComponents()).toBe(expected);
  });

  it('returns at least 80 components', () => {
    expect(totalComponents()).toBeGreaterThanOrEqual(80);
  });
});

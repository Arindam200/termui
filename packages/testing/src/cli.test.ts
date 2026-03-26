import { describe, it, expect } from 'vitest';
import { mockRegistry, mockFS } from './cli.js';

describe('mockRegistry', () => {
  it('creates a temp directory with schema.json', () => {
    const registry = mockRegistry([
      {
        name: 'spinner',
        category: 'feedback',
        files: ['Spinner.tsx'],
        source: { 'Spinner.tsx': 'export function Spinner() { return null; }' },
      },
    ]);

    expect(registry.url).toMatch(/^file:\/\//);
    registry.cleanup();
  });
});

describe('mockFS', () => {
  it('creates a sandbox directory with initial files', () => {
    const fs = mockFS({
      'package.json': JSON.stringify({ name: 'test-app', type: 'module' }),
    });

    expect(fs.exists('package.json')).toBe(true);
    expect(fs.readFile('package.json')).toContain('test-app');

    fs.cleanup();
    expect(fs.exists('package.json')).toBe(false);
  });

  it('allows writing new files', () => {
    const fs = mockFS();
    fs.writeFile('config.ts', 'export default {}');
    expect(fs.exists('config.ts')).toBe(true);
    expect(fs.readFile('config.ts')).toBe('export default {}');
    fs.cleanup();
  });
});

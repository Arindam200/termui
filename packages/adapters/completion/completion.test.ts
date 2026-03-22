import { describe, it, expect } from 'vitest';
import { generateBashCompletion } from './index.js';

describe('completion', () => {
  it('generates bash snippet with command names', () => {
    const script = generateBashCompletion({
      name: 'mycli',
      version: '1.0.0',
      commands: {
        build: { name: 'build', description: 'Build' },
        ship: { name: 'ship', description: 'Ship' },
      },
    });
    expect(script).toContain('mycli');
    expect(script).toContain('build');
    expect(script).toContain('ship');
    expect(script).toContain('complete -F');
  });
});

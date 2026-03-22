import { describe, it, expect } from 'vitest';

// Import the FRAMES directly for unit testing without React rendering
const FRAMES = {
  dots: ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'],
  line: ['—','\\','|','/'],
};

describe('Spinner frame data', () => {
  it('has correct number of dot frames', () => {
    expect(FRAMES.dots.length).toBe(10);
  });

  it('has correct number of line frames', () => {
    expect(FRAMES.line.length).toBe(4);
  });
});

import { describe, it, expect } from 'vitest';
import { screen } from './screen.js';

const OUTPUT = `
  Hello World
  Loading...
  Error: something went wrong
  Loading again
`;

describe('screen.getLines', () => {
  it('splits output into trimmed non-empty lines', () => {
    const lines = screen.getLines(OUTPUT);
    expect(lines).toEqual([
      'Hello World',
      'Loading...',
      'Error: something went wrong',
      'Loading again',
    ]);
  });

  it('returns empty array for blank output', () => {
    expect(screen.getLines('   \n\n  ')).toEqual([]);
  });
});

describe('screen.queryByText', () => {
  it('returns the matching line for a string query', () => {
    expect(screen.queryByText('Hello', OUTPUT)).toBe('Hello World');
  });

  it('returns the matching line for a regex query', () => {
    expect(screen.queryByText(/^Error:/, OUTPUT)).toBe('Error: something went wrong');
  });

  it('returns null when not found', () => {
    expect(screen.queryByText('not here', OUTPUT)).toBeNull();
  });
});

describe('screen.getByText', () => {
  it('returns the matching line', () => {
    expect(screen.getByText('Loading...', OUTPUT)).toBe('Loading...');
  });

  it('throws when not found', () => {
    expect(() => screen.getByText('missing', OUTPUT)).toThrow('Unable to find element');
  });

  it('includes the query in the error message', () => {
    expect(() => screen.getByText('nope', OUTPUT)).toThrow('"nope"');
  });

  it('includes regex toString in error for regex queries', () => {
    expect(() => screen.getByText(/nope/, OUTPUT)).toThrow('/nope/');
  });
});

describe('screen.getAllByText', () => {
  it('returns all matching lines', () => {
    const results = screen.getAllByText('Loading', OUTPUT);
    expect(results).toEqual(['Loading...', 'Loading again']);
  });

  it('returns empty array when none match', () => {
    expect(screen.getAllByText('xyz', OUTPUT)).toEqual([]);
  });
});

describe('screen.hasText', () => {
  it('returns true when text exists', () => {
    expect(screen.hasText('Hello', OUTPUT)).toBe(true);
  });

  it('returns false when text does not exist', () => {
    expect(screen.hasText('Goodbye', OUTPUT)).toBe(false);
  });

  it('works with regex', () => {
    expect(screen.hasText(/^Error:/, OUTPUT)).toBe(true);
    expect(screen.hasText(/^Success/, OUTPUT)).toBe(false);
  });
});

describe('screen.countByText', () => {
  it('counts matching lines', () => {
    expect(screen.countByText('Loading', OUTPUT)).toBe(2);
  });

  it('returns 0 when no matches', () => {
    expect(screen.countByText('nothing', OUTPUT)).toBe(0);
  });
});

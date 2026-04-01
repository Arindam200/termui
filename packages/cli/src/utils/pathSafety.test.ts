import { resolve, join } from 'path';
import { describe, expect, it } from 'vitest';
import { resolveWithin } from './pathSafety.js';

const base = resolve('/workspace/app');

describe('resolveWithin', () => {
  it('allows nested paths within the base directory', () => {
    expect(resolveWithin('/workspace/app', 'components/ui', 'feedback', 'Spinner.tsx')).toBe(
      join(base, 'components/ui', 'feedback', 'Spinner.tsx')
    );
  });

  it('rejects traversal outside the base directory', () => {
    expect(() => resolveWithin('/workspace/app', 'components/ui', '../../../package.json')).toThrow(
      /escapes base directory/i
    );
  });

  it('rejects absolute paths that bypass the base directory', () => {
    expect(() => resolveWithin('/workspace/app', '/etc/passwd')).toThrow(
      /escapes base directory/i
    );
  });
});

import { describe, it, expect, vi, afterEach } from 'vitest';
import { terminalLink } from './index.js';

describe('terminalLink', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('includes url in plain text when NO_COLOR', () => {
    vi.stubEnv('NO_COLOR', '1');
    const out = terminalLink('Docs', 'https://example.com');
    expect(out).toContain('Docs');
    expect(out).toContain('https://example.com');
  });
});

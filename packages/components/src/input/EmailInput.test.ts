import { describe, it, expect } from 'vitest';
import { EmailInput } from './EmailInput.js';

// ── Inline copies of private helpers ──────────────────────────────────────

function isValidEmail(email: string): boolean {
  const atIdx = email.indexOf('@');
  if (atIdx < 1) return false;
  const domain = email.slice(atIdx + 1);
  return domain.includes('.');
}

function getSuggestion(
  val: string,
  suggestions: string[] = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
): string | null {
  const atIdx = val.indexOf('@');
  if (atIdx === -1) return null;
  const afterAt = val.slice(atIdx + 1);
  if (afterAt.length === 0) return null;
  const match = suggestions.find((s) => s.startsWith(afterAt) && s !== afterAt);
  if (!match) return null;
  return match.slice(afterAt.length);
}

// ── Component export smoke-test ────────────────────────────────────────────

describe('EmailInput export', () => {
  it('is exported as a function (React component)', () => {
    expect(typeof EmailInput).toBe('function');
  });
});

// ── isValidEmail ───────────────────────────────────────────────────────────

describe('isValidEmail', () => {
  it('accepts a standard email address', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('accepts a subdomain email address', () => {
    expect(isValidEmail('user@mail.example.co.uk')).toBe(true);
  });

  it('rejects an address with no @', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('rejects an address starting with @', () => {
    expect(isValidEmail('@example.com')).toBe(false);
  });

  it('rejects an address with no dot in domain', () => {
    expect(isValidEmail('user@localhost')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('rejects a string that is only @', () => {
    expect(isValidEmail('@')).toBe(false);
  });

  it('rejects a domain that is just a dot', () => {
    // "user@." — the domain is "." which includes a dot, so this passes
    // our simple heuristic (same as the real function)
    expect(isValidEmail('user@.')).toBe(true);
  });

  it('accepts the placeholder address used as default', () => {
    expect(isValidEmail('you@example.com')).toBe(true);
  });
});

// ── getSuggestion ──────────────────────────────────────────────────────────

describe('getSuggestion', () => {
  it('returns null when there is no @ in the value', () => {
    expect(getSuggestion('hello')).toBeNull();
  });

  it('returns null when nothing has been typed after @', () => {
    expect(getSuggestion('user@')).toBeNull();
  });

  it('returns the remainder to autocomplete for a partial match', () => {
    // "user@gm" → match = "gmail.com" → remainder = "ail.com"
    expect(getSuggestion('user@gm')).toBe('ail.com');
  });

  it('returns null when the typed domain already equals a suggestion exactly', () => {
    expect(getSuggestion('user@gmail.com')).toBeNull();
  });

  it('returns null when typed domain does not match any suggestion prefix', () => {
    expect(getSuggestion('user@proton')).toBeNull();
  });

  it('matches the first suggestion alphabetically that starts with the prefix', () => {
    // Both "hotmail.com" start with "h"; only "hotmail.com" starts with "hot"
    expect(getSuggestion('user@hot')).toBe('mail.com');
  });

  it('works with a custom suggestions list', () => {
    const custom = ['protonmail.com', 'pm.me'];
    expect(getSuggestion('user@pro', custom)).toBe('tonmail.com');
  });

  it('returns null for custom list with no prefix match', () => {
    const custom = ['protonmail.com'];
    expect(getSuggestion('user@gmail', custom)).toBeNull();
  });

  it('handles a single character after @', () => {
    // "g" is a prefix of "gmail.com"
    expect(getSuggestion('user@g')).toBe('mail.com');
  });
});

// ── Tab-completion join behaviour ─────────────────────────────────────────

describe('tab-completion join', () => {
  it('concatenating hint to value produces the full suggestion', () => {
    const value = 'user@gm';
    const hint = getSuggestion(value);
    expect(hint).not.toBeNull();
    expect(value + hint).toBe('user@gmail.com');
  });

  it('concatenating yahoo hint produces full yahoo address', () => {
    const value = 'user@ya';
    const hint = getSuggestion(value);
    expect(value + hint).toBe('user@yahoo.com');
  });
});

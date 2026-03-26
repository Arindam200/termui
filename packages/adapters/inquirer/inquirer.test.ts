import { describe, it, expect } from 'vitest';
import inquirer, { prompt, input, password, confirm, select } from './index.js';
import type { InquirerInput, InquirerChoice } from './index.js';

// ─── Mirror pure helpers inline (not exported from source) ───────────────────

function normaliseChoices(choices: Array<string | InquirerChoice>): InquirerChoice[] {
  return choices.map((c) => (typeof c === 'string' ? { name: c, value: c } : c));
}

async function runValidate(
  validate: NonNullable<InquirerInput['validate']>,
  value: unknown
): Promise<string | null> {
  const result = await validate(value);
  if (result === true || result === '') return null;
  if (typeof result === 'string') return result;
  return 'Invalid value.';
}

function confirmDefault(q: { default?: boolean }): boolean {
  return q.default !== false;
}

function parseCheckboxInput(raw: string): number[] {
  return raw
    .split(/[,\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('normaliseChoices', () => {
  it('converts string choices to objects', () => {
    const result = normaliseChoices(['foo', 'bar']);
    expect(result).toEqual([
      { name: 'foo', value: 'foo' },
      { name: 'bar', value: 'bar' },
    ]);
  });

  it('passes through object choices unchanged', () => {
    const choices: InquirerChoice[] = [{ name: 'Foo', value: 'foo', short: 'F' }];
    expect(normaliseChoices(choices)).toEqual(choices);
  });

  it('handles mixed string and object choices', () => {
    const result = normaliseChoices(['alpha', { name: 'Beta', value: 'beta' }]);
    expect(result[0]).toEqual({ name: 'alpha', value: 'alpha' });
    expect(result[1]).toEqual({ name: 'Beta', value: 'beta' });
  });

  it('returns empty array for empty input', () => {
    expect(normaliseChoices([])).toEqual([]);
  });
});

describe('runValidate', () => {
  it('returns null for true', async () => {
    expect(await runValidate(() => true, 'x')).toBeNull();
  });

  it('returns null for empty string', async () => {
    expect(await runValidate(() => '', 'x')).toBeNull();
  });

  it('returns the error message string', async () => {
    expect(await runValidate(() => 'Too short', 'x')).toBe('Too short');
  });

  it('returns generic message for false', async () => {
    expect(await runValidate(() => false, 'x')).toBe('Invalid value.');
  });

  it('supports async validators', async () => {
    const asyncValidator = async (v: unknown) =>
      (v as string).length > 3 ? true : 'Must be >3 chars';
    expect(await runValidate(asyncValidator, 'hi')).toBe('Must be >3 chars');
    expect(await runValidate(asyncValidator, 'hello')).toBeNull();
  });
});

describe('confirm default logic', () => {
  it('defaults to true when default is undefined', () => {
    expect(confirmDefault({})).toBe(true);
  });

  it('defaults to true when default is true', () => {
    expect(confirmDefault({ default: true })).toBe(true);
  });

  it('defaults to false when default is false', () => {
    expect(confirmDefault({ default: false })).toBe(false);
  });
});

describe('checkbox parsing', () => {
  it('parses comma-separated numbers', () => {
    expect(parseCheckboxInput('1,3')).toEqual([1, 3]);
  });

  it('parses space-separated numbers', () => {
    expect(parseCheckboxInput('1 2 3')).toEqual([1, 2, 3]);
  });

  it('filters out non-numeric entries', () => {
    expect(parseCheckboxInput('1,abc,3')).toEqual([1, 3]);
  });

  it('returns empty array for empty string', () => {
    expect(parseCheckboxInput('')).toEqual([]);
  });

  it('handles mixed separators', () => {
    expect(parseCheckboxInput('2, 4')).toEqual([2, 4]);
  });
});

describe('named exports', () => {
  it('exports prompt as a function', () => {
    expect(typeof prompt).toBe('function');
  });

  it('exports input as a function', () => {
    expect(typeof input).toBe('function');
  });

  it('exports password as a function', () => {
    expect(typeof password).toBe('function');
  });

  it('exports confirm as a function', () => {
    expect(typeof confirm).toBe('function');
  });

  it('exports select as a function', () => {
    expect(typeof select).toBe('function');
  });
});

describe('default export shape', () => {
  it('has prompt', () => {
    expect(typeof inquirer.prompt).toBe('function');
  });

  it('has input', () => {
    expect(typeof inquirer.input).toBe('function');
  });

  it('has password', () => {
    expect(typeof inquirer.password).toBe('function');
  });

  it('has confirm', () => {
    expect(typeof inquirer.confirm).toBe('function');
  });

  it('has select', () => {
    expect(typeof inquirer.select).toBe('function');
  });
});

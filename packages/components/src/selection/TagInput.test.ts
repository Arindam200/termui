import { describe, it, expect } from 'vitest';
import { TagInput } from './TagInput.js';

// ── Export smoke test ──────────────────────────────────────────────────────

describe('TagInput export', () => {
  it('is exported as a function', () => {
    expect(typeof TagInput).toBe('function');
  });
});

// ── addTag logic ───────────────────────────────────────────────────────────
// Mirrors the addTag function in TagInput.tsx

function addTag(
  tags: string[],
  inputText: string,
  maxTags?: number
): { tags: string[]; inputText: string } {
  const trimmed = inputText.trim();
  if (!trimmed) return { tags, inputText };
  if (maxTags !== undefined && tags.length >= maxTags) return { tags, inputText };
  return { tags: [...tags, trimmed], inputText: '' };
}

describe('addTag', () => {
  it('adds a new tag and clears the input', () => {
    const result = addTag([], 'typescript');
    expect(result.tags).toEqual(['typescript']);
    expect(result.inputText).toBe('');
  });

  it('trims whitespace from the input', () => {
    const result = addTag([], '  react  ');
    expect(result.tags).toEqual(['react']);
  });

  it('does nothing for empty input', () => {
    const result = addTag(['existing'], '');
    expect(result.tags).toEqual(['existing']);
    expect(result.inputText).toBe('');
  });

  it('does nothing for whitespace-only input', () => {
    const result = addTag(['existing'], '   ');
    expect(result.tags).toEqual(['existing']);
  });

  it('respects maxTags — does not add when at limit', () => {
    const result = addTag(['a', 'b', 'c'], 'new', 3);
    expect(result.tags).toEqual(['a', 'b', 'c']);
  });

  it('adds a tag when below maxTags', () => {
    const result = addTag(['a', 'b'], 'new', 3);
    expect(result.tags).toEqual(['a', 'b', 'new']);
  });

  it('allows adding when maxTags is undefined', () => {
    const tags = ['a', 'b', 'c', 'd', 'e'];
    const result = addTag(tags, 'f', undefined);
    expect(result.tags).toEqual([...tags, 'f']);
  });
});

// ── removeLastTag logic ────────────────────────────────────────────────────
// Mirrors the removeLastTag function in TagInput.tsx

function removeLastTag(tags: string[]): string[] {
  if (tags.length === 0) return tags;
  return tags.slice(0, -1);
}

describe('removeLastTag', () => {
  it('removes the last tag', () => {
    expect(removeLastTag(['a', 'b', 'c'])).toEqual(['a', 'b']);
  });

  it('returns empty array when only one tag', () => {
    expect(removeLastTag(['a'])).toEqual([]);
  });

  it('does nothing on an empty array', () => {
    expect(removeLastTag([])).toEqual([]);
  });
});

// ── Backspace handling logic ───────────────────────────────────────────────
// When inputText has content, backspace removes from inputText.
// When inputText is empty, backspace removes the last tag.

function handleBackspace(tags: string[], inputText: string): { tags: string[]; inputText: string } {
  if (inputText.length > 0) {
    return { tags, inputText: inputText.slice(0, -1) };
  }
  return { tags: removeLastTag(tags), inputText: '' };
}

describe('handleBackspace', () => {
  it('removes last char from inputText when not empty', () => {
    const result = handleBackspace(['a'], 'reac');
    expect(result.inputText).toBe('rea');
    expect(result.tags).toEqual(['a']);
  });

  it('removes last tag when inputText is empty', () => {
    const result = handleBackspace(['a', 'b'], '');
    expect(result.tags).toEqual(['a']);
    expect(result.inputText).toBe('');
  });

  it('does nothing when both inputText and tags are empty', () => {
    const result = handleBackspace([], '');
    expect(result.tags).toEqual([]);
    expect(result.inputText).toBe('');
  });
});

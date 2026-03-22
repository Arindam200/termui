import { describe, it, expect } from 'vitest';
import { matter, matterWithYaml } from './index.js';
import type { GrayMatterResult } from './index.js';

// ── Basic contract ─────────────────────────────────────────────────────────

describe('matter export', () => {
  it('is a function', () => {
    expect(typeof matter).toBe('function');
  });

  it('returns an object with data and content keys', () => {
    const result = matter('hello');
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('content');
  });
});

// ── No frontmatter ─────────────────────────────────────────────────────────

describe('matter — no frontmatter', () => {
  it('returns empty data when file has no --- block', () => {
    const result = matter('Just some plain content.');
    expect(result.data).toEqual({});
  });

  it('returns the full string as content when no frontmatter', () => {
    const raw = 'Just some plain content.';
    expect(matter(raw).content).toBe(raw);
  });

  it('handles an empty string', () => {
    const result = matter('');
    expect(result.data).toEqual({});
    expect(result.content).toBe('');
  });

  it('handles a string that starts with --- but has no closing delimiter', () => {
    const result = matter('---\ntitle: Oops');
    expect(result.data).toEqual({});
    expect(result.content).toBe('---\ntitle: Oops');
  });
});

// ── With YAML frontmatter ──────────────────────────────────────────────────

describe('matter — with YAML frontmatter', () => {
  it('parses a simple string field', () => {
    const input = `---
title: Hello World
---
Body text here.`;
    const result = matter(input);
    expect(result.data['title']).toBe('Hello World');
  });

  it('parses a numeric field', () => {
    const input = `---
count: 42
---
`;
    expect(matter(input).data['count']).toBe(42);
  });

  it('parses a float field', () => {
    const input = `---
score: 3.14
---
`;
    expect(matter(input).data['score']).toBe(3.14);
  });

  it('parses boolean true', () => {
    const input = `---
published: true
---
`;
    expect(matter(input).data['published']).toBe(true);
  });

  it('parses boolean false', () => {
    const input = `---
draft: false
---
`;
    expect(matter(input).data['draft']).toBe(false);
  });

  it('parses null (null keyword)', () => {
    const input = `---
expires: null
---
`;
    expect(matter(input).data['expires']).toBeNull();
  });

  it('parses null (~ shorthand)', () => {
    const input = `---
expires: ~
---
`;
    expect(matter(input).data['expires']).toBeNull();
  });

  it('parses multiple fields', () => {
    const input = `---
title: My Post
author: Alice
date: 2024-01-15
published: true
views: 100
---
Content goes here.`;
    const result = matter(input);
    expect(result.data['title']).toBe('My Post');
    expect(result.data['author']).toBe('Alice');
    expect(result.data['published']).toBe(true);
    expect(result.data['views']).toBe(100);
  });

  it('separates frontmatter from body content', () => {
    const input = `---
title: Test
---
This is the body.`;
    const result = matter(input);
    expect(result.content).toContain('This is the body.');
    expect(result.content).not.toContain('title:');
  });

  it('trims leading whitespace from content', () => {
    const input = `---
title: Trim Test
---

Body after blank line.`;
    const result = matter(input);
    expect(result.content).not.toMatch(/^\s+/);
  });
});

// ── Quoted string values ───────────────────────────────────────────────────

describe('matter — quoted string values', () => {
  it('strips double quotes from value', () => {
    const input = `---
title: "Quoted Title"
---
`;
    expect(matter(input).data['title']).toBe('Quoted Title');
  });

  it('strips single quotes from value', () => {
    const input = `---
title: 'Single Quoted'
---
`;
    expect(matter(input).data['title']).toBe('Single Quoted');
  });
});

// ── Array fields ───────────────────────────────────────────────────────────

describe('matter — array fields', () => {
  it('parses an inline array', () => {
    const input = `---
tags: [typescript, react, node]
---
`;
    const result = matter(input);
    expect(Array.isArray(result.data['tags'])).toBe(true);
    expect(result.data['tags']).toEqual(['typescript', 'react', 'node']);
  });

  it('parses a YAML block array (- item syntax)', () => {
    const input = `---
tags:
  - alpha
  - beta
  - gamma
---
`;
    const result = matter(input);
    expect(Array.isArray(result.data['tags'])).toBe(true);
    expect(result.data['tags'] as string[]).toContain('alpha');
    expect(result.data['tags'] as string[]).toContain('beta');
    expect(result.data['tags'] as string[]).toContain('gamma');
  });
});

// ── Multiline values ───────────────────────────────────────────────────────

describe('matter — multiline values', () => {
  it('parses a block scalar (empty value key with indented lines)', () => {
    const input = `---
description:
  Line one
  Line two
---
Body.`;
    const result = matter(input);
    const desc = result.data['description'] as string;
    expect(desc).toContain('Line one');
    expect(desc).toContain('Line two');
  });
});

// ── Empty frontmatter ──────────────────────────────────────────────────────

describe('matter — empty frontmatter', () => {
  it('returns empty data for empty --- block', () => {
    const input = `---
---
Content only.`;
    const result = matter(input);
    expect(result.data).toEqual({});
    expect(result.content).toContain('Content only.');
  });
});

// ── Comments are ignored ───────────────────────────────────────────────────

describe('matter — YAML comments', () => {
  it('ignores lines starting with #', () => {
    const input = `---
# This is a comment
title: Commented
---
`;
    const result = matter(input);
    expect(result.data['title']).toBe('Commented');
    expect(Object.keys(result.data)).not.toContain('# This is a comment');
  });
});

// ── Excerpt option ─────────────────────────────────────────────────────────

describe('matter — excerpt option', () => {
  it('returns undefined excerpt when option is not set', () => {
    const input = `---
title: Post
---
First paragraph.

Second paragraph.`;
    expect(matter(input).excerpt).toBeUndefined();
  });

  it('returns excerpt when { excerpt: true } is passed', () => {
    const input = `---
title: Post
---
First paragraph.

Second paragraph.`;
    const result = matter(input, { excerpt: true });
    expect(result.excerpt).toBeDefined();
    expect(result.excerpt).toContain('First paragraph.');
  });

  it('excerpt does not include content past the first blank line', () => {
    const input = `---
title: Post
---
Intro text.

More content here.`;
    const result = matter(input, { excerpt: true });
    expect(result.excerpt).not.toContain('More content here.');
  });
});

// ── matterWithYaml ─────────────────────────────────────────────────────────

describe('matterWithYaml', () => {
  it('parses nested YAML via yaml package', async () => {
    const input = `---
meta:
  tags: [a, b]
---
Body`;
    const r = await matterWithYaml(input);
    expect(r.data['meta']).toEqual({ tags: ['a', 'b'] });
    expect(r.content.trim()).toBe('Body');
  });
});

// ── GrayMatterResult type shape ────────────────────────────────────────────

describe('GrayMatterResult type', () => {
  it('result conforms to the GrayMatterResult interface', () => {
    const result: GrayMatterResult = matter('hello');
    expect(typeof result.data).toBe('object');
    expect(typeof result.content).toBe('string');
  });
});

/**
 * Example: termui/gray-matter — parse frontmatter from markdown
 *
 * Run: npx tsx examples/with-gray-matter/index.ts
 */

import { matter } from '../../packages/adapters/gray-matter/index.js';

const markdown = `---
title: My Blog Post
author: Arindam
tags: [typescript, terminal, ui]
published: true
---

# Hello World

This is the body of the post.
`;

const result = matter(markdown, { excerpt: true });
console.log('Data:', result.data);
console.log('Excerpt:', result.excerpt);
console.log('Content:', result.content.slice(0, 80) + '...');

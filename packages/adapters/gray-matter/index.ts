/**
 * termui/gray-matter adapter — inline frontmatter parser compatible with gray-matter API.
 * Parses YAML-like frontmatter from --- delimiters. No external deps.
 */

export interface GrayMatterResult {
  data: Record<string, unknown>;
  content: string;
  excerpt?: string;
}

/**
 * Parse a simple YAML-like key: value frontmatter block.
 * Supports: strings, numbers, booleans, null, arrays (- item), nested objects (indented key: val).
 */
function parseYaml(yamlStr: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yamlStr.split('\n');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    // Skip blank lines and comments
    if (!line.trim() || line.trim().startsWith('#')) {
      i++;
      continue;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) {
      i++;
      continue;
    }

    const key = line.slice(0, colonIdx).trim();
    const rawVal = line.slice(colonIdx + 1).trim();

    if (rawVal === '' || rawVal === '|' || rawVal === '>') {
      // Multi-line value or array — look ahead for indented lines
      const childLines: string[] = [];
      const baseIndent = line.match(/^(\s*)/)?.[1]?.length ?? 0;
      i++;

      // Check if next lines are array items
      let isArray = false;
      while (i < lines.length) {
        const nextLine = lines[i]!;
        if (!nextLine.trim()) {
          i++;
          continue;
        }
        const nextIndent = nextLine.match(/^(\s*)/)?.[1]?.length ?? 0;
        if (nextIndent <= baseIndent && nextLine.trim()) break;
        childLines.push(nextLine.trim());
        if (nextLine.trim().startsWith('- ')) isArray = true;
        i++;
      }

      if (isArray) {
        result[key] = childLines
          .filter((l) => l.startsWith('- '))
          .map((l) => parseScalar(l.slice(2).trim()));
      } else {
        result[key] = childLines.join('\n');
      }
      continue;
    }

    result[key] = parseScalar(rawVal);
    i++;
  }

  return result;
}

function parseScalar(val: string): unknown {
  // Remove surrounding quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }
  // Boolean
  if (val === 'true') return true;
  if (val === 'false') return false;
  // Null
  if (val === 'null' || val === '~') return null;
  // Number
  if (/^-?\d+(\.\d+)?$/.test(val)) return parseFloat(val);
  // Inline array [a, b, c]
  if (val.startsWith('[') && val.endsWith(']')) {
    return val
      .slice(1, -1)
      .split(',')
      .map((s) => parseScalar(s.trim()));
  }
  return val;
}

/**
 * Parse frontmatter + content from a string.
 * Compatible with the gray-matter API.
 */
export function matter(input: string, opts?: { excerpt?: boolean }): GrayMatterResult {
  const DELIMITER = '---';

  // Check if file starts with ---
  if (!input.startsWith(DELIMITER)) {
    return { data: {}, content: input };
  }

  // Find the closing ---
  const after = input.slice(DELIMITER.length);
  const closeIdx = after.indexOf('\n' + DELIMITER);

  if (closeIdx === -1) {
    // No closing delimiter found
    return { data: {}, content: input };
  }

  const yamlStr = after.slice(0, closeIdx).trim();
  let content = after.slice(closeIdx + DELIMITER.length + 1).trimStart();

  // Remove trailing --- if present (some formats have it)
  if (content.startsWith(DELIMITER)) {
    content = content.slice(DELIMITER.length).trimStart();
  }

  const data = parseYaml(yamlStr);

  let excerpt: string | undefined;
  if (opts?.excerpt) {
    // Excerpt is everything up to the first blank line or first ---
    const excerptMatch = content.match(/^([\s\S]+?)(\n\n|^---)/m);
    excerpt = excerptMatch ? excerptMatch[1]!.trim() : content.trim();
  }

  return { data, content, excerpt };
}

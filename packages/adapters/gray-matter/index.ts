/**
 * termui/gray-matter adapter — inline frontmatter parser compatible with gray-matter API.
 * Use {@link matterWithYaml} for full YAML (requires optional peer `yaml`).
 */

export interface GrayMatterResult {
  data: Record<string, unknown>;
  content: string;
  excerpt?: string;
}

function parseSimpleYaml(yamlStr: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yamlStr.split('\n');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
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
      const childLines: string[] = [];
      const baseIndent = line.match(/^(\s*)/)?.[1]?.length ?? 0;
      i++;

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
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (val === 'null' || val === '~') return null;
  if (/^-?\d+(\.\d+)?$/.test(val)) return parseFloat(val);
  if (val.startsWith('[') && val.endsWith(']')) {
    return val
      .slice(1, -1)
      .split(',')
      .map((s) => parseScalar(s.trim()));
  }
  return val;
}

function extractFrontmatter(input: string): { yamlStr: string; content: string } | null {
  const DELIMITER = '---';
  if (!input.startsWith(DELIMITER)) return null;

  const after = input.slice(DELIMITER.length);
  const closeIdx = after.indexOf('\n' + DELIMITER);
  if (closeIdx === -1) return null;

  const yamlStr = after.slice(0, closeIdx).trim();
  let content = after.slice(closeIdx + DELIMITER.length + 1).trimStart();
  if (content.startsWith(DELIMITER)) {
    content = content.slice(DELIMITER.length).trimStart();
  }

  return { yamlStr, content };
}

function extractExcerpt(content: string): string | undefined {
  const match = content.match(/^([\s\S]+?)(\n\n|^---)/m);
  return match ? match[1]!.trim() : content.trim();
}

/**
 * Parse frontmatter + content from a string (zero deps).
 * Compatible with the gray-matter API.
 */
export function matter(input: string, opts?: { excerpt?: boolean }): GrayMatterResult {
  const fm = extractFrontmatter(input);
  if (!fm) return { data: {}, content: input };

  const data = parseSimpleYaml(fm.yamlStr);
  const excerpt = opts?.excerpt ? extractExcerpt(fm.content) : undefined;
  return { data, content: fm.content, excerpt };
}

/**
 * Parse frontmatter using the `yaml` package for full YAML compatibility.
 * Falls back to {@link matter} if `yaml` is unavailable or parsing throws.
 */
export async function matterWithYaml(
  input: string,
  opts?: { excerpt?: boolean }
): Promise<GrayMatterResult> {
  const fm = extractFrontmatter(input);
  if (!fm) return { data: {}, content: input };

  let data: Record<string, unknown>;
  try {
    const yamlMod = await import('yaml');
    const parsed = yamlMod.parse(fm.yamlStr);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      data = parsed as Record<string, unknown>;
    } else {
      data = { value: parsed };
    }
  } catch {
    return matter(input, opts);
  }

  const excerpt = opts?.excerpt ? extractExcerpt(fm.content) : undefined;
  return { data, content: fm.content, excerpt };
}

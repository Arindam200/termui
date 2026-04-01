import { resolve, sep } from 'path';

export function resolveWithin(baseDir: string, ...segments: string[]): string {
  const base = resolve(baseDir);
  const target = resolve(base, ...segments);
  const baseWithSep = base.endsWith(sep) ? base : `${base}${sep}`;

  if (target !== base && !target.startsWith(baseWithSep)) {
    throw new Error(`Path escapes base directory: ${segments.join('/')}`);
  }

  return target;
}

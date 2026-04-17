/**
 * Fail if published dist/*.js still import @termui/adapters (not on npm).
 * tsup must inline adapters via esbuild alias; bare re-exports break consumers.
 */
const FORBIDDEN = '@termui/adapters';
import fs from 'fs';
import path from 'path';

const dist = path.join(process.cwd(), 'dist');
if (!fs.existsSync(dist)) {
  console.error('verify-dist: dist/ missing — run pnpm run build:root first');
  process.exit(1);
}

function walkJsFiles(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkJsFiles(p, acc);
    else if (ent.name.endsWith('.js')) acc.push(p);
  }
  return acc;
}

const files = walkJsFiles(dist);
const bad = [];
for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  if (c.includes(FORBIDDEN)) bad.push(f);
}

if (bad.length) {
  console.error(`verify-dist: dist must not reference ${FORBIDDEN} (not published to npm):\n`);
  for (const f of bad) console.error(' ', f);
  process.exit(1);
}

console.log(`verify-dist: ok (no ${FORBIDDEN} in dist/)`);

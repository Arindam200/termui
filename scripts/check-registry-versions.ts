#!/usr/bin/env tsx
/**
 * Validates that every component in registry/schema.json has:
 * 1. A corresponding meta.json with a version field
 * 2. All listed source files present
 *
 * Usage: npx tsx scripts/check-registry-versions.ts
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const REGISTRY_DIR = new URL('../registry', import.meta.url).pathname;
const SCHEMA_PATH = join(REGISTRY_DIR, 'schema.json');

const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf-8')) as {
  components: Record<string, { files: string[]; category: string; version?: string }>;
};

let errors = 0;
let warnings = 0;

for (const [name, entry] of Object.entries(schema.components)) {
  const compDir = join(REGISTRY_DIR, 'components', name);
  const metaPath = join(compDir, 'meta.json');

  if (!existsSync(metaPath)) {
    console.error(`MISSING meta.json: registry/components/${name}/meta.json`);
    errors++;
    continue;
  }

  const meta = JSON.parse(readFileSync(metaPath, 'utf-8')) as {
    version?: string;
    files?: string[];
  };

  if (!meta.version) {
    console.warn(`NO VERSION: registry/components/${name}/meta.json`);
    warnings++;
  }

  for (const file of meta.files ?? entry.files ?? []) {
    const src = join(compDir, file);
    if (!existsSync(src)) {
      console.error(`MISSING SOURCE: registry/components/${name}/${file}`);
      errors++;
    }
  }
}

if (errors > 0) {
  console.error(`\n${errors} error(s), ${warnings} warning(s)`);
  process.exit(1);
} else {
  console.log(
    `Registry OK — ${Object.keys(schema.components).length} components, ${warnings} warnings`
  );
  process.exit(0);
}

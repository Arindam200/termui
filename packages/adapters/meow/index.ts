/**
 * termui/meow adapter — meow-compatible CLI argument parser.
 * Pure built-in implementation; no meow peer dep required.
 * Parses flags (--flag, --flag=value, -f shorthand), positional inputs,
 * and supports --help / --version auto-handling.
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import path from 'path';

export interface FlagDefinition {
  type: 'string' | 'boolean' | 'number';
  shortFlag?: string;
  default?: unknown;
  isRequired?: boolean;
  aliases?: string[];
}

export interface MeowOptions {
  importMeta?: { url: string };
  description?: string | false;
  version?: string;
  flags?: Record<string, FlagDefinition>;
  help?: string;
  allowUnknownFlags?: boolean;
}

export interface MeowResult {
  input: string[];
  flags: Record<string, unknown>;
  unnormalizedFlags: Record<string, unknown>;
  pkg: Record<string, unknown>;
  help: string;
  showHelp(exitCode?: number): void;
  showVersion(): void;
}

// Convert kebab-case to camelCase
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

// Build reverse lookup: shortFlag/alias -> canonical camelCase name
function buildShortMap(flags: Record<string, FlagDefinition>): Map<string, string> {
  const map = new Map<string, string>();
  for (const [name, def] of Object.entries(flags)) {
    const canonical = toCamelCase(name);
    if (def.shortFlag) map.set(def.shortFlag, canonical);
    if (def.aliases) {
      for (const alias of def.aliases) map.set(toCamelCase(alias), canonical);
    }
  }
  return map;
}

function parseArgs(
  argv: string[],
  flagDefs: Record<string, FlagDefinition>,
  allowUnknown: boolean
): { input: string[]; flags: Record<string, unknown>; unnorm: Record<string, unknown> } {
  const input: string[] = [];
  const flags: Record<string, unknown> = {};
  const unnorm: Record<string, unknown> = {};

  // Build canonical name map (kebab → camel) for flags
  const canonMap = new Map<string, string>();
  for (const name of Object.keys(flagDefs)) {
    canonMap.set(name, toCamelCase(name));
    canonMap.set(toCamelCase(name), toCamelCase(name));
  }
  const shortMap = buildShortMap(flagDefs);

  // Set defaults
  for (const [name, def] of Object.entries(flagDefs)) {
    const canon = toCamelCase(name);
    if (def.default !== undefined) {
      flags[canon] = def.default;
      unnorm[name] = def.default;
    } else if (def.type === 'boolean') {
      flags[canon] = false;
      unnorm[name] = false;
    }
  }

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i]!;

    if (arg === '--') {
      // Everything after -- is positional
      input.push(...argv.slice(i + 1));
      break;
    }

    if (arg.startsWith('--')) {
      const withoutDashes = arg.slice(2);
      const eqIdx = withoutDashes.indexOf('=');
      let rawName: string;
      let rawValue: string | undefined;

      if (eqIdx !== -1) {
        rawName = withoutDashes.slice(0, eqIdx);
        rawValue = withoutDashes.slice(eqIdx + 1);
      } else {
        rawName = withoutDashes;
      }

      const canon = canonMap.get(rawName) ?? (allowUnknown ? toCamelCase(rawName) : undefined);
      if (!canon) {
        i++;
        continue;
      }

      const defKey = Object.keys(flagDefs).find((k) => toCamelCase(k) === canon) ?? rawName;
      const def = flagDefs[defKey];

      if (def?.type === 'boolean') {
        const val = rawValue !== undefined ? rawValue !== 'false' : true;
        flags[canon] = val;
        unnorm[rawName] = val;
      } else {
        // string or number — next arg is value if not inlined
        if (rawValue === undefined) {
          const nextArg = argv[i + 1];
          if (nextArg !== undefined && !nextArg.startsWith('-')) {
            rawValue = nextArg;
            i++;
          }
        }
        const coerced = def?.type === 'number' ? Number(rawValue) : rawValue;
        flags[canon] = coerced;
        unnorm[rawName] = coerced;
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      // Short flag: -f
      const short = arg.slice(1);
      const canon = shortMap.get(short);
      if (!canon) {
        i++;
        continue;
      }
      const defEntry = Object.entries(flagDefs).find(([n]) => toCamelCase(n) === canon);
      const def = defEntry?.[1];
      const defName = defEntry?.[0] ?? short;

      if (def?.type === 'boolean') {
        flags[canon] = true;
        unnorm[defName] = true;
      } else {
        const nextArg = argv[i + 1];
        if (nextArg !== undefined && !nextArg.startsWith('-')) {
          const coerced = def?.type === 'number' ? Number(nextArg) : nextArg;
          flags[canon] = coerced;
          unnorm[defName] = coerced;
          i++;
        }
      }
    } else {
      input.push(arg);
    }

    i++;
  }

  return { input, flags, unnorm };
}

function buildHelpText(
  helpText: string,
  description: string | false | undefined,
  flagDefs: Record<string, FlagDefinition>
): string {
  const lines: string[] = [];

  if (description) {
    lines.push('  ' + description, '');
  }

  lines.push(helpText.trim());

  if (Object.keys(flagDefs).length > 0) {
    lines.push('', '  Options:');
    for (const [name, def] of Object.entries(flagDefs)) {
      const flag = `--${name}`;
      const short = def.shortFlag ? `, -${def.shortFlag}` : '';
      const type = def.type !== 'boolean' ? ` <${def.type}>` : '';
      const dflt = def.default !== undefined ? `  [default: ${String(def.default)}]` : '';
      const req = def.isRequired ? '  (required)' : '';
      lines.push(`    ${flag}${short}${type}${dflt}${req}`);
    }
  }

  return lines.join('\n');
}

function tryReadPkg(importMetaUrl: string): Record<string, unknown> {
  try {
    const dir = path.dirname(fileURLToPath(importMetaUrl));
    const pkgPath = path.resolve(dir, 'package.json');
    const raw = readFileSync(pkgPath, 'utf8');
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function meow(helpText: string, options: MeowOptions = {}): MeowResult {
  const argv = process.argv.slice(2);
  const flagDefs = options.flags ?? {};
  const allowUnknown = options.allowUnknownFlags ?? true;

  const { input, flags, unnorm } = parseArgs(argv, flagDefs, allowUnknown);

  const help = buildHelpText(helpText, options.description, flagDefs);

  const pkg: Record<string, unknown> = options.importMeta?.url
    ? tryReadPkg(options.importMeta.url)
    : {};

  const version = options.version ?? (pkg['version'] as string | undefined) ?? 'unknown';

  function showHelp(exitCode = 0): void {
    process.stdout.write(help + '\n');
    process.exit(exitCode);
  }

  function showVersion(): void {
    process.stdout.write(version + '\n');
    process.exit(0);
  }

  // Handle --help and --version if passed
  if (flags['help'] === true) showHelp(0);
  if (flags['version'] === true) showVersion();

  // Validate required flags
  for (const [name, def] of Object.entries(flagDefs)) {
    if (def.isRequired) {
      const canon = toCamelCase(name);
      if (flags[canon] === undefined || flags[canon] === '') {
        process.stderr.write(`Error: --${name} is required\n`);
        showHelp(1);
      }
    }
  }

  return {
    input,
    flags,
    unnormalizedFlags: unnorm,
    pkg,
    help,
    showHelp,
    showVersion,
  };
}

export default meow;

/**
 * Example: termui/git — inspect current repo status
 *
 * Run: npx tsx examples/with-git/index.ts
 */

import { getGitBranches, getGitStatusShort } from '../../packages/adapters/git/index.js';
import { pc } from '../../packages/adapters/picocolors/index.js';

function parseStatusShort(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of s.split(' ')) {
    const i = part.indexOf(':');
    if (i === -1) continue;
    out[part.slice(0, i)] = part.slice(i + 1);
  }
  return out;
}

const LABEL_W = 14;

function kv(label: string, value: string, opts?: { emphasis?: boolean }) {
  const l = pc.dim(label.padEnd(LABEL_W));
  const v = opts?.emphasis ? pc.bold(pc.cyan(value)) : value;
  return `  ${l} ${v}`;
}

async function main() {
  const cwd = process.cwd();
  const status = parseStatusShort(await getGitStatusShort(cwd));
  const branches = await getGitBranches(cwd);
  const current = status.branch ?? '';

  const ahead = Number(status.ahead ?? 0);
  const behind = Number(status.behind ?? 0);
  let sync = pc.dim('in sync with upstream');
  if (ahead > 0 && behind > 0) {
    sync = pc.yellow(`${ahead} ahead, ${behind} behind`);
  } else if (ahead > 0) {
    sync = pc.yellow(`${ahead} commit${ahead === 1 ? '' : 's'} ahead`);
  } else if (behind > 0) {
    sync = pc.yellow(`${behind} commit${behind === 1 ? '' : 's'} behind`);
  }

  const out: string[] = [
    '',
    `  ${pc.bold(pc.cyan('Git'))} ${pc.dim('·')} ${pc.dim('working tree')}`,
    `  ${pc.dim('─'.repeat(42))}`,
    kv('Branch', current, { emphasis: true }),
    kv('Remote', sync),
    '',
    `  ${pc.dim('Changes')}`,
    `  ${pc.dim('─'.repeat(42))}`,
    kv('Staged', status.staged ?? '0'),
    kv('Modified', status.modified ?? '0'),
    kv('Created', status.created ?? '0'),
    kv('Deleted', status.deleted ?? '0'),
    '',
    `  ${pc.bold('Local branches')} ${pc.dim(`(${branches.length})`)}`,
    `  ${pc.dim('─'.repeat(42))}`,
  ];

  for (const b of branches) {
    const isHead = b === current;
    const bullet = isHead ? pc.green('●') : pc.dim('·');
    const label = isHead ? pc.bold(pc.cyan(b)) : pc.dim(b);
    out.push(`  ${bullet} ${label}`);
  }

  out.push('');
  console.log(out.join('\n'));
}

main().catch(console.error);

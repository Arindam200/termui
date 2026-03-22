/**
 * npx termui dev
 *
 * Watch mode — monitors your component directory and re-runs the
 * preview whenever a TypeScript/TSX file changes.
 *
 * Usage: npx termui dev [--dir <path>]
 */
import { watch, existsSync } from 'fs';
import { join, resolve } from 'path';
import { spawn, type ChildProcess } from 'child_process';
import { getConfig } from '../utils/config.js';

export async function dev(args: string[]): Promise<void> {
  const config = getConfig();

  // Resolve the directory to watch
  const dirArgIdx = args.indexOf('--dir');
  const watchDir =
    dirArgIdx !== -1 && args[dirArgIdx + 1]
      ? resolve(args[dirArgIdx + 1]!)
      : resolve(process.cwd(), config.componentsDir);

  const ansi = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    magenta: '\x1b[35m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
  };

  console.log(`\n${ansi.bold}${ansi.magenta}◆ TermUI Dev${ansi.reset}  hot-reload mode`);
  console.log(`${ansi.dim}Watching: ${watchDir}${ansi.reset}`);
  console.log(`${ansi.dim}Press q or Ctrl+C to exit${ansi.reset}\n`);

  let child: ChildProcess | null = null;
  let debounce: ReturnType<typeof setTimeout> | null = null;
  let isExiting = false;

  function killChild(): Promise<void> {
    return new Promise((resolve) => {
      if (!child) {
        resolve();
        return;
      }
      const c = child;
      child = null;
      c.once('exit', () => resolve());
      c.kill('SIGTERM');
      // Force-kill after 2s if SIGTERM not enough
      setTimeout(() => {
        try { c.kill('SIGKILL'); } catch { /* already dead */ }
        resolve();
      }, 2000);
    });
  }

  async function startPreview(): Promise<void> {
    await killChild();
    if (isExiting) return;

    // Forward extra args (minus --dir <path>) to preview
    const previewArgs: string[] = [];
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--dir') { i++; continue; }
      previewArgs.push(args[i]!);
    }

    child = spawn(
      process.execPath,
      [process.argv[1]!, 'preview', ...previewArgs],
      { stdio: 'inherit', env: { ...process.env, FORCE_COLOR: '1' } }
    );

    child.on('exit', (code, signal) => {
      if (!isExiting && signal !== 'SIGTERM' && signal !== 'SIGKILL') {
        // Preview exited on its own (user pressed q) — keep watching
        console.log(`\n${ansi.dim}[dev] preview closed — waiting for file changes…${ansi.reset}`);
      }
    });
  }

  function scheduleRestart(filename: string): void {
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(async () => {
      console.log(
        `\n${ansi.yellow}[dev]${ansi.reset} changed: ${ansi.cyan}${filename}${ansi.reset} — reloading…\n`
      );
      await startPreview();
    }, 250);
  }

  // Set up file watcher
  const watchTarget = existsSync(watchDir) ? watchDir : process.cwd();
  if (watchTarget !== watchDir) {
    console.log(`${ansi.dim}[dev] ${watchDir} not found — watching cwd instead${ansi.reset}\n`);
  }

  watch(watchTarget, { recursive: true }, (_event, filename) => {
    if (!filename) return;
    if (filename.endsWith('.tsx') || filename.endsWith('.ts')) {
      scheduleRestart(filename);
    }
  });

  // Handle exit
  async function cleanup(): Promise<void> {
    if (isExiting) return;
    isExiting = true;
    if (debounce) clearTimeout(debounce);
    await killChild();
    process.exit(0);
  }

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Allow 'q' to quit (raw mode)
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (key: string) => {
      if (key === 'q' || key === '\x03') cleanup(); // q or Ctrl+C
    });
  }

  // Start initial preview
  await startPreview();
}

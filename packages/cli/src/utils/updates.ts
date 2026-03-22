import semver from 'semver';
import { createRequire } from 'module';

const PACKAGE_NAME = 'termui';

/** Check for newer version of termui and print a notice if found */
export async function checkForUpdates(): Promise<void> {
  try {
    // Dynamic import of latest-version (ESM-only)
    const { default: latestVersion } = await import('latest-version');
    const latest = await latestVersion(PACKAGE_NAME);

    // Get current version
    const require = createRequire(import.meta.url);
    let current: string;
    try {
      const pkg = require('../package.json') as { version: string };
      current = pkg.version;
    } catch {
      return;
    }

    if (semver.gt(latest, current)) {
      const msg = [
        '',
        `\x1b[33m┌─────────────────────────────────────────────────────┐\x1b[0m`,
        `\x1b[33m│  Update available: \x1b[1mv${current}\x1b[0m\x1b[33m → \x1b[1mv${latest}\x1b[0m`,
        `\x1b[33m│  Run: \x1b[36mnpm install -g termui\x1b[0m\x1b[33m to update             │\x1b[0m`,
        `\x1b[33m└─────────────────────────────────────────────────────┘\x1b[0m`,
        '',
      ].join('\n');
      process.stderr.write(msg);
    }
  } catch {
    // Silently fail — update check should never block the CLI
  }
}

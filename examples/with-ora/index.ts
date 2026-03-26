// Run with: npx tsx examples/with-ora/index.ts

/**
 * Example: termui/ora — spinner-based progress steps
 */

import { ora } from '../../packages/adapters/ora/index.js';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  // Step 1 — succeed
  const step1 = ora('Checking dependencies...').start();
  await delay(200);
  step1.succeed('Dependencies up to date');

  // Step 2 — fail then info
  const step2 = ora({ text: 'Connecting to remote...', color: 'yellow' }).start();
  await delay(200);
  step2.warn('Remote responded slowly — continuing anyway');

  // Step 3 — succeed with updated text
  const step3 = ora({ text: 'Building project...', color: 'cyan', spinner: 'arc' }).start();
  await delay(200);
  step3.text = 'Finalising build...';
  await delay(200);
  step3.succeed('Build complete');

  // Step 4 — demonstrate fail
  const step4 = ora('Running post-build checks...').start();
  await delay(200);
  step4.fail('Lint errors found — run `npm run lint` to fix');

  // Step 5 — info (no spinner, just a status line)
  const step5 = ora('Publishing artefacts...').start();
  await delay(200);
  step5.info('Dry-run mode — publish skipped');

  process.exit(0);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

/**
 * Example: termui/clack — interactive prompt flow
 *
 * Run: npx tsx examples/with-clack/index.ts
 */

import {
  intro,
  outro,
  text,
  confirm,
  select,
  spinner,
  log,
} from '../../packages/adapters/clack/index.js';

async function main() {
  intro('TermUI Clack Example');

  const name = await text({ message: 'What is your project name?' });
  log.info(`Project: ${name}`);

  const framework = await select({
    message: 'Pick a framework',
    options: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
      { value: 'svelte', label: 'Svelte' },
    ],
  });

  const install = await confirm({ message: 'Install dependencies?' });

  if (install) {
    const s = spinner();
    s.start('Installing...');
    await new Promise((r) => setTimeout(r, 1000));
    s.stop('Dependencies installed');
  }

  log.success(`Created ${name} with ${framework}`);
  outro('Done!');
}

main();

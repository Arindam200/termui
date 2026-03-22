/**
 * Example: termui/args — minimal CLI with styled help
 *
 * Run: npx tsx examples/with-args/index.ts --help
 */

import { createCLI } from '../../packages/adapters/args/index.js';

const cli = createCLI({
  name: 'my-tool',
  version: '1.0.0',
  description: 'An example CLI tool built with termui/args',
  commands: {
    build: {
      name: 'build',
      description: 'Build the project',
      args: {
        output: { description: 'Output directory', default: 'dist' },
        minify: { description: 'Enable minification' },
      },
    },
    deploy: {
      name: 'deploy',
      description: 'Deploy to production',
      args: {
        env: { description: 'Target environment', required: true },
      },
    },
  },
});

const result = cli.parse();
if (result) {
  console.log('Command:', result.command);
  console.log('Args:', result.args);
}

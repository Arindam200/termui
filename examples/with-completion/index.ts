/**
 * Example: termui/completion — generate shell completion scripts
 *
 * Run: npx tsx examples/with-completion/index.ts
 */

import { generateBashCompletion, generateZshCompletion } from '../../packages/adapters/completion/index.js';

const config = {
  name: 'my-tool',
  version: '1.0.0',
  commands: {
    build: { name: 'build', description: 'Build the project' },
    deploy: { name: 'deploy', description: 'Deploy the project' },
    test: { name: 'test', description: 'Run tests' },
  },
};

console.log('=== Bash Completion ===');
console.log(generateBashCompletion(config));

console.log('=== Zsh Completion ===');
console.log(generateZshCompletion(config));

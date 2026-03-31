// Run: npx tsx examples/with-inquirer/index.ts

import { prompt } from 'termui/inquirer';

const answers = await prompt([
  {
    type: 'input',
    name: 'username',
    message: 'What is your name?',
    default: 'World',
    validate(value: unknown) {
      if (typeof value === 'string' && value.trim().length > 0) return true;
      return 'Name cannot be empty.';
    },
  },
  {
    type: 'list',
    name: 'framework',
    message: 'Which framework do you prefer?',
    choices: [
      { name: 'React', value: 'react' },
      { name: 'Vue', value: 'vue' },
      { name: 'Svelte', value: 'svelte' },
      { name: 'Solid', value: 'solid' },
    ],
    default: 'react',
  },
  {
    type: 'confirm',
    name: 'typescript',
    message: 'Do you use TypeScript?',
    default: true,
  },
]);

console.log('\n--- Your answers ---');
console.log(`Name:       ${answers.username}`);
console.log(`Framework:  ${answers.framework}`);
console.log(`TypeScript: ${answers.typescript ? 'Yes' : 'No'}`);
console.log('--------------------\n');

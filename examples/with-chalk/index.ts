// Run with: npx tsx examples/with-chalk/index.ts

/**
 * Example: termui/chalk — chalk-compatible color API
 */

import { chalk } from '../../packages/adapters/chalk/index.js';

// --- Basic named styles ---
console.log(chalk.bold.red('Error!') + '  something went wrong');
console.log(chalk.green('Success!') + '  operation completed');
console.log(chalk.dim('debug info: pid=' + process.pid));

// --- Bright variants ---
console.log(chalk.yellowBright('Warning:') + '  disk usage above 80%');
console.log(chalk.cyanBright('Info:') + '    cache primed with 142 entries');

// --- Truecolor via hex ---
console.log(chalk.hex('#FF6B6B')('Custom color') + '  coral red via hex');
console.log(chalk.hex('#00d7ff').bold('TermUI') + '  truecolor + bold');

// --- Background badges ---
console.log(chalk.bgCyan.black(' INFO ') + '  ' + chalk.dim('server listening on :3000'));
console.log(chalk.bgRed.whiteBright(' FAIL ') + '  ' + chalk.red('test suite exited with code 1'));
console.log(chalk.bgGreen.black(' PASS ') + '  ' + chalk.green('all 42 tests passed'));

// --- Composed styles ---
console.log(
  [
    chalk.bold('build'),
    chalk.dim('→'),
    chalk.green('dist/'),
    chalk.dim(`(${(1.24).toFixed(2)} MB)`),
  ].join(' ')
);

// --- Chained modifiers ---
console.log(chalk.underline.blueBright('https://termui.dev'));

// --- rgb() and ansi256() ---
console.log(chalk.rgb(255, 165, 0)('rgb(255,165,0) — orange'));
console.log(chalk.ansi256(208)('ansi256(208)   — orange via 256-color palette'));

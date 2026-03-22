/**
 * Example: termui/picocolors — ANSI color helpers
 *
 * Run: npx tsx examples/with-picocolors/index.ts
 */

import { pc } from '../../packages/adapters/picocolors/index.js';

console.log(pc.bold('Bold text'));
console.log(pc.red('Error: something went wrong'));
console.log(pc.green('Success!'));
console.log(pc.cyan(pc.underline('https://termui.dev')));
console.log(pc.hex('#ff6600')('Custom hex color'));
console.log(pc.bgRed(pc.white(' ALERT ')));
console.log(pc.dim('muted text'));

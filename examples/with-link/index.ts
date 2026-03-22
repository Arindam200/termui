/**
 * Example: termui/link — OSC 8 clickable hyperlinks
 *
 * Run: npx tsx examples/with-link/index.ts
 */

import { terminalLink } from '../../packages/adapters/link/index.js';

console.log('Visit:', terminalLink('TermUI Docs', 'https://termui.dev'));
console.log('Repo:', terminalLink('GitHub', 'https://github.com/Arindam200/termui'));

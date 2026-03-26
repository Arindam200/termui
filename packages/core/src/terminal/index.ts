export { announce, getAccessibleName } from './accessibility.js';
export type { AriaProps } from './accessibility.js';

export {
  reset,
  bold,
  dim,
  italic,
  underline,
  blink,
  inverse,
  hidden,
  strikethrough,
  fg,
  bg,
  fg256,
  bg256,
  fgRgb,
  bgRgb,
  parseHex,
  fgHex,
  bgHex,
  cursor,
  screen,
  osc,
  style as ansiStyle,
  stripAnsi,
  visibleWidth,
} from './ansi.js';
export { getTerminalCapabilities, resetCapabilitiesCache } from './capabilities.js';
export type { TerminalCapabilities } from './capabilities.js';
// Legacy aliases re-exported for backwards compatibility
export { getCapabilities, refreshCapabilities, detectCapabilities } from './capabilities.js';
export { getBorderChars, resolveBoxBorder } from './borders.js';
export type { BorderMode, BorderChars } from './borders.js';

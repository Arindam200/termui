/**
 * Terminal capability detection.
 * Detects: color depth, unicode support, mouse support, true-color.
 */
export type ColorDepth = 1 | 4 | 8 | 24;
export interface TerminalCapabilities {
  colorDepth: ColorDepth;
  supportsUnicode: boolean;
  supportsTrueColor: boolean;
  supports256Color: boolean;
  supportsMouse: boolean;
  columns: number;
  rows: number;
  isTTY: boolean;
}
/** Detect current terminal capabilities from process environment */
export declare function detectCapabilities(): TerminalCapabilities;
export declare function getCapabilities(): TerminalCapabilities;
/** Force re-detect capabilities (useful after SIGWINCH) */
export declare function refreshCapabilities(): TerminalCapabilities;
//# sourceMappingURL=capabilities.d.ts.map

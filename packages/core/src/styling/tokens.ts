/**
 * Design token types for TermUI theming.
 * All theme objects must conform to this shape.
 */

export interface ColorTokens {
  // Primary palette
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;

  // Semantic colors
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  error: string;
  errorForeground: string;
  info: string;
  infoForeground: string;

  // UI surfaces
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;

  // Interactive states
  focusRing: string;
  selection: string;
  selectionForeground: string;
}

export interface SpacingTokens {
  0: number;
  1: number;
  2: number;
  3: number;
  4: number;
  6: number;
  8: number;
}

export interface TypographyTokens {
  // Font weights represented as boolean (terminal limitation)
  bold: boolean;
  // Text sizes don't apply directly (monospace), but we keep them for semantic tagging
  sm: string; // dim text hint
  base: string;
  lg: string; // bold text hint
  xl: string; // bold + color hint
}

export interface BorderTokens {
  style: 'single' | 'double' | 'round' | 'bold' | 'singleDouble' | 'doubleSingle' | 'classic';
  color: string;
  focusColor: string;
}

export interface Theme {
  name: string;
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  border: BorderTokens;
}

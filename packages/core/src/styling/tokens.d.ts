/**
 * Design token types for TermUI theming.
 * All theme objects must conform to this shape.
 */
export interface ColorTokens {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  error: string;
  errorForeground: string;
  info: string;
  infoForeground: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
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
  bold: boolean;
  sm: string;
  base: string;
  lg: string;
  xl: string;
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
//# sourceMappingURL=tokens.d.ts.map

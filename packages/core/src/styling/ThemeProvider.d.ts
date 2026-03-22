import { type ReactNode } from 'react';
import type { Theme } from './tokens.js';
interface ThemeProviderProps {
    theme?: Theme;
    children: ReactNode;
}
export declare function ThemeProvider({ theme, children }: ThemeProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useTheme(): Theme;
export declare function useThemeUpdater(): (theme: Theme) => void;
/** Create a custom theme by merging with the default theme */
export declare function createTheme(overrides: Partial<Theme> & {
    name: string;
}): Theme;
export {};
//# sourceMappingURL=ThemeProvider.d.ts.map
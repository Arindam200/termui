import React, { createContext, useContext, type ReactNode } from 'react';
import type { Theme } from './tokens.js';
import { defaultTheme } from './themes/default.js';
import { MotionContext, isReducedMotion } from '../hooks/useMotion.js';
import { UnicodeContext, isNoUnicode } from '../hooks/useUnicode.js';
export type { MotionContextValue } from '../hooks/useMotion.js';
export { MotionContext, isReducedMotion } from '../hooks/useMotion.js';
export { UnicodeContext, isNoUnicode } from '../hooks/useUnicode.js';
export type { UnicodeContextValue } from '../hooks/useUnicode.js';

/**
 * Detect whether the terminal uses a dark or light background.
 *
 * Reads the `COLORFGBG` environment variable (set by most terminals in
 * `"foreground;background"` format) and falls back to `TERM_BACKGROUND`.
 * Defaults to `'dark'` when neither variable is present — most developer
 * terminals use dark themes.
 *
 * @returns `'dark'` or `'light'`.
 *
 * @example
 * ```tsx
 * const scheme = detectColorScheme();
 * const theme = scheme === 'dark' ? darkTheme : lightTheme;
 * ```
 */
export function detectColorScheme(): 'dark' | 'light' {
  const colorFgBg = process.env['COLORFGBG'];
  if (colorFgBg) {
    // Format is "foreground;background" where 0 = black bg (dark) and 15 = white bg (light)
    const parts = colorFgBg.split(';');
    const bg = parseInt(parts[parts.length - 1] ?? '0', 10);
    // Background color 0-6 is typically dark, 8-15 is typically light
    if (!isNaN(bg)) {
      return bg <= 6 ? 'dark' : 'light';
    }
  }
  // Check TERM_BACKGROUND if set by some terminal emulators
  const termBg = process.env['TERM_BACKGROUND'];
  if (termBg === 'light') return 'light';
  if (termBg === 'dark') return 'dark';

  // Default to dark — most developer terminals use dark themes
  return 'dark';
}

/** Props for `AutoThemeProvider`. */
export interface AutoThemeProviderProps {
  /** Theme applied when the terminal background is detected as dark. */
  darkTheme: Theme;
  /** Theme applied when the terminal background is detected as light. */
  lightTheme: Theme;
  children: ReactNode;
}

/**
 * Automatically selects between a dark and light theme based on the terminal's
 * colour scheme, detected via `detectColorScheme()`. Renders a `ThemeProvider`
 * with the appropriate theme so child components receive the correct tokens
 * without any manual switching logic.
 *
 * @param props.darkTheme - Theme used when the terminal background is dark.
 * @param props.lightTheme - Theme used when the terminal background is light.
 * @param props.children - React subtree that will receive the selected theme.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AutoThemeProvider darkTheme={oceanDark} lightTheme={oceanLight}>
 *       <Dashboard />
 *     </AutoThemeProvider>
 *   );
 * }
 * ```
 */
export function AutoThemeProvider({ darkTheme, lightTheme, children }: AutoThemeProviderProps) {
  const scheme = detectColorScheme();
  const selectedTheme = scheme === 'dark' ? darkTheme : lightTheme;
  return <ThemeProvider theme={selectedTheme}>{children}</ThemeProvider>;
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultTheme,
  setTheme: () => {},
});

interface ThemeProviderProps {
  theme?: Theme;
  reducedMotion?: boolean;
  /**
   * Force ASCII/no-Unicode mode for all child components.
   * When omitted, auto-detected from `NO_UNICODE=1` env var and terminal
   * capability detection (`supportsUnicode`).
   */
  noUnicode?: boolean;
  children: ReactNode;
}

/**
 * Provide a theme to all child TermUI components.
 *
 * Wrap your root component with `ThemeProvider` to apply a custom theme.
 * All TermUI components consume the theme via `useTheme()`. The theme can
 * be changed at runtime by passing a new `theme` prop.
 *
 * @param props.theme - Theme object (default: `defaultTheme`). Create custom
 *   themes with `createTheme()`.
 * @param props.reducedMotion - Force reduced motion for all animated children.
 *   When omitted, automatically detected from `NO_MOTION` / `CI` env vars.
 * @param props.noUnicode - Force ASCII fallbacks for all animated children.
 *   When omitted, automatically detected from `NO_UNICODE=1` / terminal capabilities.
 * @param props.children - React child tree that will receive the theme.
 *
 * @example
 * ```tsx
 * import { ThemeProvider, createTheme } from '@termui/core';
 *
 * const myTheme = createTheme({ name: 'my-theme', colors: { primary: '#ff6b6b' } });
 *
 * function App() {
 *   return (
 *     <ThemeProvider theme={myTheme}>
 *       <MyComponent />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export function ThemeProvider({
  theme = defaultTheme,
  reducedMotion,
  noUnicode,
  children,
}: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = React.useState<Theme>(theme);
  const motionReduced = reducedMotion ?? isReducedMotion();
  // unicode = false when NO_UNICODE=1 OR terminal capability says no, OR prop forces it
  const unicodeEnabled = noUnicode !== undefined ? !noUnicode : !isNoUnicode();

  React.useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, setTheme: setCurrentTheme }}>
      <MotionContext.Provider value={{ reduced: motionReduced }}>
        <UnicodeContext.Provider value={{ unicode: unicodeEnabled }}>
          {children}
        </UnicodeContext.Provider>
      </MotionContext.Provider>
    </ThemeContext.Provider>
  );
}

/**
 * Consume the current theme from `ThemeProvider` context.
 *
 * Returns the active `Theme` object. Falls back to `defaultTheme` when used
 * outside a `ThemeProvider`. Re-renders the component whenever the theme changes.
 *
 * @returns The active `Theme` object.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const theme = useTheme();
 *   return <Text color={theme.colors.primary}>Hello</Text>;
 * }
 * ```
 */
export function useTheme(): Theme {
  return useContext(ThemeContext).theme;
}

/**
 * Return the `setTheme` setter from the nearest `ThemeProvider`. Call the
 * returned function with a new `Theme` object to swap the active theme at
 * runtime (e.g. in response to a user preference toggle).
 *
 * @returns A stable `(theme: Theme) => void` dispatcher. Falls back to a
 *   no-op when called outside a `ThemeProvider`.
 *
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const setTheme = useThemeUpdater();
 *   return (
 *     <Button onPress={() => setTheme(highContrastTheme)}>
 *       High contrast
 *     </Button>
 *   );
 * }
 * ```
 */
export function useThemeUpdater(): (theme: Theme) => void {
  return useContext(ThemeContext).setTheme;
}

/**
 * Create a custom theme by deep-merging with the default theme.
 *
 * Top-level keys (`colors`, `spacing`, `typography`, `border`) are merged
 * shallowly so you only need to provide the values you want to override.
 * All other keys from `defaultTheme` are preserved.
 *
 * @param overrides - Partial theme overrides. `name` is required to identify
 *   the theme. Nested objects (`colors`, `spacing`, etc.) are merged with the
 *   defaults — only the keys you specify are overridden.
 * @returns A complete `Theme` object ready for use with `ThemeProvider`.
 *
 * @example
 * ```tsx
 * const myTheme = createTheme({
 *   name: 'ocean',
 *   colors: { primary: '#0ea5e9', secondary: '#38bdf8' },
 * });
 * ```
 */
export function createTheme(overrides: Partial<Theme> & { name: string }): Theme {
  return {
    ...defaultTheme,
    ...overrides,
    colors: {
      ...defaultTheme.colors,
      ...(overrides.colors ?? {}),
    },
    spacing: {
      ...defaultTheme.spacing,
      ...(overrides.spacing ?? {}),
    },
    typography: {
      ...defaultTheme.typography,
      ...(overrides.typography ?? {}),
    },
    border: {
      ...defaultTheme.border,
      ...(overrides.border ?? {}),
    },
  };
}

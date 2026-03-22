import React, { createContext, useContext, type ReactNode } from 'react';
import type { Theme } from './tokens.js';
import { defaultTheme } from './themes/default.js';

/**
 * Detect if the terminal likely uses a dark background.
 * Uses COLORFGBG env var (set by most terminals: "15;0" = dark, "0;15" = light)
 * or defaults to dark (most developer terminals are dark).
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

/** Props for auto dark/light theme switching */
export interface AutoThemeProviderProps {
  darkTheme: Theme;
  lightTheme: Theme;
  children: ReactNode;
}

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
  children: ReactNode;
}

export function ThemeProvider({ theme = defaultTheme, children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = React.useState<Theme>(theme);

  React.useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, setTheme: setCurrentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext).theme;
}

export function useThemeUpdater(): (theme: Theme) => void {
  return useContext(ThemeContext).setTheme;
}

/** Create a custom theme by merging with the default theme */
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

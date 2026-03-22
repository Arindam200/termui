import React, { createContext, useContext, type ReactNode } from 'react';
import type { Theme } from './tokens.js';
import { defaultTheme } from './themes/default.js';

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

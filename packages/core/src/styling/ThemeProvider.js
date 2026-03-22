import { jsx as _jsx } from "react/jsx-runtime";
import React, { createContext, useContext } from 'react';
import { defaultTheme } from './themes/default.js';
const ThemeContext = createContext({
    theme: defaultTheme,
    setTheme: () => { },
});
export function ThemeProvider({ theme = defaultTheme, children }) {
    const [currentTheme, setCurrentTheme] = React.useState(theme);
    React.useEffect(() => {
        setCurrentTheme(theme);
    }, [theme]);
    return (_jsx(ThemeContext.Provider, { value: { theme: currentTheme, setTheme: setCurrentTheme }, children: children }));
}
export function useTheme() {
    return useContext(ThemeContext).theme;
}
export function useThemeUpdater() {
    return useContext(ThemeContext).setTheme;
}
/** Create a custom theme by merging with the default theme */
export function createTheme(overrides) {
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
//# sourceMappingURL=ThemeProvider.js.map
import { createTheme } from '../ThemeProvider.js';

export const highContrastTheme = createTheme({
  name: 'high-contrast',
  colors: {
    primary: '#FFFFFF',
    primaryForeground: '#000000',
    secondary: '#FFFF00', // bright yellow
    secondaryForeground: '#000000',
    accent: '#00FFFF', // bright cyan
    accentForeground: '#000000',
    success: '#00FF00',
    successForeground: '#000000',
    warning: '#FFFF00',
    warningForeground: '#000000',
    error: '#FF0000',
    errorForeground: '#FFFFFF',
    info: '#00FFFF',
    infoForeground: '#000000',
    background: '#000000',
    foreground: '#FFFFFF',
    muted: '#333333',
    mutedForeground: '#FFFFFF',
    border: '#FFFFFF',
    focusRing: '#FFFF00',
    selection: '#FFFFFF',
    selectionForeground: '#000000',
  },
  border: {
    style: 'bold',
    color: '#FFFFFF',
    focusColor: '#FFFF00',
  },
});

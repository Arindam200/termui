import type { Theme } from '../tokens.js';

export const catppuccinTheme: Theme = {
  name: 'catppuccin',
  colors: {
    primary: '#CBA6F7',
    primaryForeground: '#1E1E2E',
    secondary: '#89B4FA',
    secondaryForeground: '#1E1E2E',
    accent: '#F38BA8',
    accentForeground: '#1E1E2E',

    success: '#A6E3A1',
    successForeground: '#1E1E2E',
    warning: '#F9E2AF',
    warningForeground: '#1E1E2E',
    error: '#F38BA8',
    errorForeground: '#1E1E2E',
    info: '#89B4FA',
    infoForeground: '#1E1E2E',

    background: '#1E1E2E',
    foreground: '#CDD6F4',
    muted: '#313244',
    mutedForeground: '#6C7086',
    border: '#45475A',

    focusRing: '#CBA6F7',
    selection: '#313244',
    selectionForeground: '#CDD6F4',
  },
  spacing: {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    6: 6,
    8: 8,
  },
  typography: {
    bold: true,
    sm: 'dim',
    base: '',
    lg: 'bold',
    xl: 'bold',
  },
  border: {
    style: 'round',
    color: '#45475A',
    focusColor: '#CBA6F7',
  },
};

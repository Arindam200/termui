import type { Theme } from '../tokens.js';

export const tokyoNightTheme: Theme = {
  name: 'tokyoNight',
  colors: {
    primary: '#7AA2F7',
    primaryForeground: '#1A1B26',
    secondary: '#BB9AF7',
    secondaryForeground: '#1A1B26',
    accent: '#BB9AF7',
    accentForeground: '#1A1B26',

    success: '#9ECE6A',
    successForeground: '#1A1B26',
    warning: '#E0AF68',
    warningForeground: '#1A1B26',
    error: '#F7768E',
    errorForeground: '#1A1B26',
    info: '#7DCFFF',
    infoForeground: '#1A1B26',

    background: '#24283B',
    foreground: '#C0CAF5',
    muted: '#1F2335',
    mutedForeground: '#565F89',
    border: '#3B4261',

    focusRing: '#7AA2F7',
    selection: '#364A82',
    selectionForeground: '#C0CAF5',
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
    color: '#3B4261',
    focusColor: '#7AA2F7',
  },
};

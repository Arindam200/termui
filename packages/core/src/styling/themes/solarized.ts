import type { Theme } from '../tokens.js';

export const solarizedTheme: Theme = {
  name: 'solarized',
  colors: {
    primary: '#268BD2',
    primaryForeground: '#FDF6E3',
    secondary: '#2AA198',
    secondaryForeground: '#FDF6E3',
    accent: '#CB4B16',
    accentForeground: '#FDF6E3',

    success: '#859900',
    successForeground: '#FDF6E3',
    warning: '#B58900',
    warningForeground: '#FDF6E3',
    error: '#DC322F',
    errorForeground: '#FDF6E3',
    info: '#2AA198',
    infoForeground: '#FDF6E3',

    background: '#002B36',
    foreground: '#839496',
    muted: '#073642',
    mutedForeground: '#586E75',
    border: '#586E75',

    focusRing: '#268BD2',
    selection: '#073642',
    selectionForeground: '#93A1A1',
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
    style: 'single',
    color: '#586E75',
    focusColor: '#268BD2',
  },
};

import type { Theme } from '../tokens.js';

export const monokaiTheme: Theme = {
  name: 'monokai',
  colors: {
    primary: '#A6E22E',
    primaryForeground: '#272822',
    secondary: '#66D9E8',
    secondaryForeground: '#272822',
    accent: '#FD971F',
    accentForeground: '#272822',

    success: '#A6E22E',
    successForeground: '#272822',
    warning: '#E6DB74',
    warningForeground: '#272822',
    error: '#F92672',
    errorForeground: '#F8F8F2',
    info: '#66D9E8',
    infoForeground: '#272822',

    background: '#272822',
    foreground: '#F8F8F2',
    muted: '#3E3D32',
    mutedForeground: '#75715E',
    border: '#75715E',

    focusRing: '#A6E22E',
    selection: '#49483E',
    selectionForeground: '#F8F8F2',
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
    color: '#75715E',
    focusColor: '#A6E22E',
  },
};

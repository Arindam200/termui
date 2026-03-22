import type { Theme } from '../tokens.js';

export const oneDarkTheme: Theme = {
  name: 'oneDark',
  colors: {
    primary: '#61AFEF',
    primaryForeground: '#282C34',
    secondary: '#C678DD',
    secondaryForeground: '#282C34',
    accent: '#C678DD',
    accentForeground: '#282C34',

    success: '#98C379',
    successForeground: '#282C34',
    warning: '#E5C07B',
    warningForeground: '#282C34',
    error: '#E06C75',
    errorForeground: '#282C34',
    info: '#56B6C2',
    infoForeground: '#282C34',

    background: '#282C34',
    foreground: '#ABB2BF',
    muted: '#3E4451',
    mutedForeground: '#5C6370',
    border: '#4B5263',

    focusRing: '#61AFEF',
    selection: '#3E4451',
    selectionForeground: '#ABB2BF',
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
    color: '#4B5263',
    focusColor: '#61AFEF',
  },
};

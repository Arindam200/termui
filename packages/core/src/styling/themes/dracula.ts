import type { Theme } from '../tokens.js';

export const draculaTheme: Theme = {
  name: 'dracula',
  colors: {
    primary: '#BD93F9',
    primaryForeground: '#282A36',
    secondary: '#6272A4',
    secondaryForeground: '#F8F8F2',
    accent: '#FF79C6',
    accentForeground: '#282A36',

    success: '#50FA7B',
    successForeground: '#282A36',
    warning: '#F1FA8C',
    warningForeground: '#282A36',
    error: '#FF5555',
    errorForeground: '#F8F8F2',
    info: '#8BE9FD',
    infoForeground: '#282A36',

    background: '#282A36',
    foreground: '#F8F8F2',
    muted: '#44475A',
    mutedForeground: '#6272A4',
    border: '#6272A4',

    focusRing: '#BD93F9',
    selection: '#44475A',
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
    style: 'round',
    color: '#6272A4',
    focusColor: '#BD93F9',
  },
};

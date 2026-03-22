import type { Theme } from '../tokens.js';

export const defaultTheme: Theme = {
  name: 'default',
  colors: {
    primary: '#7C3AED',
    primaryForeground: '#FFFFFF',
    secondary: '#6B7280',
    secondaryForeground: '#FFFFFF',
    accent: '#8B5CF6',
    accentForeground: '#FFFFFF',

    success: '#10B981',
    successForeground: '#FFFFFF',
    warning: '#F59E0B',
    warningForeground: '#000000',
    error: '#EF4444',
    errorForeground: '#FFFFFF',
    info: '#3B82F6',
    infoForeground: '#FFFFFF',

    background: '#000000',
    foreground: '#FFFFFF',
    muted: '#374151',
    mutedForeground: '#9CA3AF',
    border: '#4B5563',

    focusRing: '#8B5CF6',
    selection: '#7C3AED',
    selectionForeground: '#FFFFFF',
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
    color: '#4B5563',
    focusColor: '#8B5CF6',
  },
};

import { describe, it, expect } from 'vitest';
import { defaultTheme } from './themes/default.js';
import { draculaTheme } from './themes/dracula.js';
import { nordTheme } from './themes/nord.js';
import { createTheme } from './ThemeProvider.js';

describe('Themes', () => {
  it('default theme has required color tokens', () => {
    expect(defaultTheme.colors.primary).toBeTruthy();
    expect(defaultTheme.colors.background).toBeTruthy();
    expect(defaultTheme.colors.foreground).toBeTruthy();
    expect(defaultTheme.colors.error).toBeTruthy();
    expect(defaultTheme.colors.success).toBeTruthy();
    expect(defaultTheme.name).toBe('default');
  });

  it('dracula theme has correct primary color', () => {
    expect(draculaTheme.colors.primary).toBe('#BD93F9');
    expect(draculaTheme.name).toBe('dracula');
  });

  it('nord theme has correct primary color', () => {
    expect(nordTheme.colors.primary).toBe('#88C0D0');
    expect(nordTheme.name).toBe('nord');
  });

  it('all themes have the same token keys', () => {
    const defaultKeys = Object.keys(defaultTheme.colors).sort();
    const draculaKeys = Object.keys(draculaTheme.colors).sort();
    const nordKeys = Object.keys(nordTheme.colors).sort();
    expect(draculaKeys).toEqual(defaultKeys);
    expect(nordKeys).toEqual(defaultKeys);
  });
});

describe('createTheme', () => {
  it('merges overrides with default theme', () => {
    const custom = createTheme({
      name: 'custom',
      colors: {
        primary: '#FF0000',
      } as never,
    });
    expect(custom.name).toBe('custom');
    expect(custom.colors.primary).toBe('#FF0000');
    // Non-overridden tokens should inherit from default
    expect(custom.colors.background).toBe(defaultTheme.colors.background);
  });

  it('preserves default spacing when not overriding', () => {
    const custom = createTheme({ name: 'minimal' });
    expect(custom.spacing).toEqual(defaultTheme.spacing);
  });

  it('allows overriding border style', () => {
    const custom = createTheme({
      name: 'squared',
      border: { style: 'single', color: '#ffffff', focusColor: '#ff0000' },
    });
    expect(custom.border.style).toBe('single');
  });
});

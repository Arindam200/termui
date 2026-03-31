/**
 * Svelte 5 context helpers for TermUI theme tokens.
 *
 * NOTE: This file uses Svelte's getContext/setContext APIs and must be
 * used inside a Svelte component tree. Import from within a .svelte file
 * or a .svelte.ts file that is part of your Svelte build pipeline.
 *
 * @example
 * ```svelte
 * <!-- App.svelte (root) -->
 * <script lang="ts">
 *   import { provideTheme } from 'termui/svelte';
 *   import { defaultTheme } from './theme';
 *   provideTheme(defaultTheme);
 * </script>
 *
 * <!-- Child.svelte -->
 * <script lang="ts">
 *   import { themeTokens } from 'termui/svelte';
 *   const theme = themeTokens();
 * </script>
 *
 * <p style="color: {theme.colors.primary}">Themed text</p>
 * ```
 */

import { getContext, setContext } from 'svelte';
import type { Theme } from '@termui/types';

const THEME_KEY = Symbol('termui-theme');

/**
 * Provide a TermUI theme to all descendant Svelte components.
 * Call this once in a root or layout component.
 */
export function provideTheme(theme: Theme): void {
  setContext(THEME_KEY, theme);
}

/**
 * Access the nearest provided TermUI theme.
 * Throws if no theme has been provided higher in the component tree.
 */
export function themeTokens(): Theme {
  const theme = getContext<Theme>(THEME_KEY);
  if (!theme) {
    throw new Error(
      '[termui/svelte] No theme provided. Call provideTheme(theme) in a parent component.'
    );
  }
  return theme;
}

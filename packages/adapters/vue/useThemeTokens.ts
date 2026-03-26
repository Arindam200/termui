import { computed, inject, type InjectionKey, type Ref } from 'vue';
import type { Theme } from '@termui/types';

export const TERMUI_THEME_KEY: InjectionKey<Ref<Theme>> = Symbol('termui-theme');

/**
 * Vue 3 composable to access TermUI theme tokens.
 * Call provide(TERMUI_THEME_KEY, ref(myTheme)) in a parent component.
 */
export function useThemeTokens() {
  const theme = inject(TERMUI_THEME_KEY);
  if (!theme) {
    throw new Error('[termui/vue] No theme provided. Wrap your app with a ThemeProvider.');
  }
  return {
    colors: computed(() => theme.value.colors),
    spacing: computed(() => theme.value.spacing),
    border: computed(() => theme.value.border),
  };
}

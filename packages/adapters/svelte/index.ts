/**
 * termui/svelte — type bridge and composables for Svelte 5 users.
 *
 * TermUI components are React/Ink components, but their prop interfaces
 * are available via @termui/types for type-safe Svelte component wrappers.
 *
 * Usage:
 *   import type { SpinnerProps, Theme } from '@termui/adapters/svelte';
 *
 * The composables below (terminalSize, themeTokens) are provided as
 * Svelte 5 rune-based examples in the sibling .svelte.ts files.
 * They require a Svelte project with the Svelte preprocessor to use directly,
 * because the $state/$effect rune syntax is not valid TypeScript on its own.
 *
 * See:
 *   ./terminalSize.svelte.ts  — reactive terminal dimensions (Svelte 5 runes)
 *   ./themeTokens.svelte.ts   — theme context helpers (Svelte 5)
 */

// Re-export all TermUI prop types for use in Svelte component type annotations
export type * from '@termui/types';

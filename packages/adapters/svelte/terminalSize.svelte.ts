/**
 * Svelte 5 rune-based reactive terminal size store.
 * Mirrors TermUI's useResize() hook for Svelte 5 consumers.
 *
 * NOTE: This file uses $state and $effect rune syntax introduced in Svelte 5.
 * It must be processed by the Svelte compiler/preprocessor and cannot be used
 * outside a Svelte project. Import from within a .svelte file or a .svelte.ts
 * file that is included in your Svelte build pipeline.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { terminalSize } from 'termui/svelte';
 *   const size = terminalSize();
 * </script>
 *
 * <p>Terminal: {size.columns} × {size.rows}</p>
 * ```
 */

export function terminalSize() {
  let columns = $state(process.stdout.columns ?? 80);
  let rows = $state(process.stdout.rows ?? 24);

  $effect(() => {
    const update = () => {
      columns = process.stdout.columns ?? 80;
      rows = process.stdout.rows ?? 24;
    };
    process.stdout.on('resize', update);
    return () => process.stdout.off('resize', update);
  });

  return {
    get columns() {
      return columns;
    },
    get rows() {
      return rows;
    },
  };
}

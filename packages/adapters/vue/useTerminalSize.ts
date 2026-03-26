import { ref, onMounted, onUnmounted } from 'vue';

/**
 * Vue 3 composable that reactively tracks terminal dimensions.
 * Mirrors TermUI's useResize() hook for Vue consumers.
 */
export function useTerminalSize() {
  const columns = ref(process.stdout.columns ?? 80);
  const rows = ref(process.stdout.rows ?? 24);

  const update = () => {
    columns.value = process.stdout.columns ?? 80;
    rows.value = process.stdout.rows ?? 24;
  };

  onMounted(() => process.stdout.on('resize', update));
  onUnmounted(() => process.stdout.off('resize', update));

  return { columns, rows };
}

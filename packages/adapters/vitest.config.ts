import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      thresholds: {
        branches: 68,
        lines: 42,
      },
    },
  },
});

import { defineConfig } from 'tsup';
import path from 'path';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    core: 'src/core.ts',
    components: 'src/components.ts',
    hooks: 'src/hooks.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'ink', 'strip-ansi'],
  esbuildOptions(options) {
    options.alias = {
      '@termui/core': path.resolve(__dirname, 'packages/core/src/index.ts'),
      '@termui/core/hooks': path.resolve(__dirname, 'packages/core/src/hooks/index.ts'),
      '@termui/core/styling': path.resolve(__dirname, 'packages/core/src/styling/index.ts'),
      '@termui/core/terminal': path.resolve(__dirname, 'packages/core/src/terminal/index.ts'),
      '@termui/components': path.resolve(__dirname, 'packages/components/src/index.ts'),
    };
  },
});

import { defineConfig } from 'tsup';
import path from 'path';

const sharedOptions = {
  format: ['esm'] as ['esm'],
  clean: true,
  sourcemap: false,
  minify: true,
  external: [
    'react',
    'ink',
    'strip-ansi',
    /^@termui\/adapters(\/.*)?$/,
    'yargs',
    'yargs/helpers',
    'commander',
    'simple-git',
    '@octokit/rest',
    'keytar',
    'node-pty',
    'execa',
    'conf',
    'env-paths',
    'semver',
    'latest-version',
    'yaml',
  ],
  esbuildOptions(
    options: Parameters<Exclude<import('tsup').Options['esbuildOptions'], undefined>>[0]
  ) {
    options.alias = {
      '@termui/core': path.resolve(__dirname, 'packages/core/src/index.ts'),
      '@termui/core/hooks': path.resolve(__dirname, 'packages/core/src/hooks/index.ts'),
      '@termui/core/styling': path.resolve(__dirname, 'packages/core/src/styling/index.ts'),
      '@termui/core/terminal': path.resolve(__dirname, 'packages/core/src/terminal/index.ts'),
      '@termui/components': path.resolve(__dirname, 'packages/components/src/index.ts'),
    };
  },
};

export default defineConfig([
  {
    ...sharedOptions,
    entry: {
      index: 'src/index.ts',
      core: 'src/core.ts',
      components: 'src/components.ts',
      hooks: 'src/hooks.ts',
      args: 'src/args.ts',
      clack: 'src/clack.ts',
      'clack-ink': 'src/clack-ink.ts',
      picocolors: 'src/picocolors.ts',
      'gray-matter': 'src/gray-matter.ts',
      git: 'src/git.ts',
      github: 'src/github.ts',
      keychain: 'src/keychain.ts',
      pty: 'src/pty.ts',
      execa: 'src/execa.ts',
      link: 'src/link.ts',
      'semver-update': 'src/semver-update.ts',
      conf: 'src/conf.ts',
      completion: 'src/completion.ts',
      'color-env': 'src/color-env.ts',
    },
    dts: true,
  },
  {
    ...sharedOptions,
    entry: {
      cli: 'packages/cli/src/cli.ts',
    },
    banner: {
      js: '#!/usr/bin/env node',
    },
    dts: false,
    clean: false,
  },
]);

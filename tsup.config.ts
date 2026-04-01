import { defineConfig } from 'tsup';
import path from 'path';

const sharedOptions = {
  format: ['esm'] as ['esm'],
  clean: true,
  sourcemap: false,
  minify: true,
  tsconfig: 'tsconfig.build.json',
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
    '@anthropic-ai/sdk',
    'openai',
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
      '@termui/components/layout': path.resolve(
        __dirname,
        'packages/components/src/layout/index.ts'
      ),
      '@termui/components/typography': path.resolve(
        __dirname,
        'packages/components/src/typography/index.ts'
      ),
      '@termui/components/input': path.resolve(__dirname, 'packages/components/src/input/index.ts'),
      '@termui/components/selection': path.resolve(
        __dirname,
        'packages/components/src/selection/index.ts'
      ),
      '@termui/components/data': path.resolve(__dirname, 'packages/components/src/data/index.ts'),
      '@termui/components/feedback': path.resolve(
        __dirname,
        'packages/components/src/feedback/index.ts'
      ),
      '@termui/components/navigation': path.resolve(
        __dirname,
        'packages/components/src/navigation/index.ts'
      ),
      '@termui/components/overlays': path.resolve(
        __dirname,
        'packages/components/src/overlays/index.ts'
      ),
      '@termui/components/forms': path.resolve(__dirname, 'packages/components/src/forms/index.ts'),
      '@termui/components/utility': path.resolve(
        __dirname,
        'packages/components/src/utility/index.ts'
      ),
      '@termui/components/charts': path.resolve(
        __dirname,
        'packages/components/src/charts/index.ts'
      ),
      '@termui/components/templates': path.resolve(
        __dirname,
        'packages/components/src/templates/index.ts'
      ),
      '@termui/components/ai': path.resolve(__dirname, 'packages/components/src/ai/index.ts'),
      '@termui/testing': path.resolve(__dirname, 'packages/testing/src/index.ts'),
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
      'components-layout': 'src/components-layout.ts',
      'components-typography': 'src/components-typography.ts',
      'components-input': 'src/components-input.ts',
      'components-selection': 'src/components-selection.ts',
      'components-data': 'src/components-data.ts',
      'components-feedback': 'src/components-feedback.ts',
      'components-navigation': 'src/components-navigation.ts',
      'components-overlays': 'src/components-overlays.ts',
      'components-forms': 'src/components-forms.ts',
      'components-utility': 'src/components-utility.ts',
      'components-charts': 'src/components-charts.ts',
      'components-templates': 'src/components-templates.ts',
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
      'components-ai': 'src/components-ai.ts',
      ai: 'src/ai.ts',
      'conversation-store': 'src/conversation-store.ts',
      chalk: 'src/chalk.ts',
      ora: 'src/ora.ts',
      meow: 'src/meow.ts',
      commander: 'src/commander.ts',
      inquirer: 'src/inquirer.ts',
      imperative: 'src/imperative.ts',
      svelte: 'src/svelte.ts',
      vue: 'src/vue.ts',
      voice: 'src/voice.ts',
      testing: 'src/testing.ts',
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

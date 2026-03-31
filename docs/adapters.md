---
title: Adapters Reference
---

# Adapters Reference

TermUI provides drop-in replacements and bridges for popular CLI ecosystem libraries. All adapters are exported as **subpath imports** from `termui/<name>` and are tree-shakable. Peer dependencies are optional — the adapter gracefully falls back or throws a descriptive error when a peer is absent.

---

## `termui/chalk`

Chalk-compatible chainable ANSI color API. Built-in implementation — no `chalk` peer dep required at runtime. Respects `NO_COLOR`, `FORCE_COLOR`, and `CLICOLOR`.

```ts
import { chalk } from 'termui/chalk';
```

**Key exports:** `chalk` (default + named), `ChalkInstance`

```ts
import { chalk } from 'termui/chalk';

console.log(chalk.bold.cyan('TermUI'));
console.log(chalk.red('Error:'), chalk.dim('something went wrong'));
console.log(chalk.hex('#ff6600')('Custom color'));
console.log(chalk.bgBlue.white(' INFO '));
```

---

## `termui/ora`

Ora-compatible terminal spinner. Built-in implementation — no `ora` peer dep required. Supports multiple spinner styles (`dots`, `line`, `arc`, `circle`, `bouncingBar`) and `succeed` / `fail` / `warn` / `info` finalizers.

```ts
import { ora } from 'termui/ora';
```

**Key exports:** `ora` (default + named), `OraSpinner`, `OraOptions`

```ts
import { ora } from 'termui/ora';

const spinner = ora({ text: 'Loading data…', color: 'cyan' }).start();

await fetchData();

spinner.succeed('Data loaded');
// or spinner.fail('Request failed');
```

---

## `termui/meow`

Meow-compatible CLI argument parser. Built-in implementation — no `meow` peer dep required. Parses `--flag`, `--flag=value`, and `-f` shorthand; auto-handles `--help` and `--version`.

```ts
import { meow } from 'termui/meow';
```

**Key exports:** `meow` (default + named), `MeowResult`, `MeowOptions`, `FlagDefinition`

```ts
import { meow } from 'termui/meow';

const cli = meow('Usage: mycli <input>', {
  importMeta: import.meta,
  flags: {
    output: { type: 'string', shortFlag: 'o' },
    verbose: { type: 'boolean', shortFlag: 'v', default: false },
  },
});

console.log(cli.input); // positional args
console.log(cli.flags); // { output: '...', verbose: false }
```

---

## `termui/commander`

Wraps Commander with TermUI-styled help output (themed section headings, dimmed descriptions, colored errors). Requires the `commander` peer dependency.

```sh
npm install commander
```

```ts
import { createCommanderProgram, loadCommander } from 'termui/commander';
```

**Key exports:** `createCommanderProgram`, `loadCommander`, `CommanderOptions`

```ts
import { createCommanderProgram } from 'termui/commander';

const { program } = createCommanderProgram({
  name: 'mycli',
  version: '1.0.0',
  description: 'My TermUI CLI',
  themeColor: '#00d7ff',
});

((await program) as any).command('build').action(() => console.log('building…'));
((await program) as any).parse();
```

---

## `termui/inquirer`

Inquirer-compatible prompts. Built-in implementation — no `inquirer` peer dep required. Supports `input`, `password`, `confirm`, `list`, `checkbox`, `rawlist`, and `number` question types, plus ergonomic named helpers.

```ts
import { prompt, input, password, confirm, select } from 'termui/inquirer';
```

**Key exports:** `prompt`, `input`, `password`, `confirm`, `select`, `InquirerInput`, `InquirerChoice`

```ts
import { prompt } from 'termui/inquirer';

const answers = await prompt([
  { type: 'input', name: 'name', message: 'Your name?' },
  { type: 'confirm', name: 'deploy', message: 'Deploy now?', default: false },
  { type: 'list', name: 'env', message: 'Environment?', choices: ['dev', 'staging', 'production'] },
]);
console.log(answers);
```

---

## `termui/clack`

`@clack/prompts`-style interactive CLI prompts. Built-in implementation, no clack peer dep required. Includes `intro`/`outro` banners, `text`, `confirm`, `select`, `multiselect`, `spinner`, `group`, `tasks`, and structured `log` helpers.

```ts
import { intro, outro, text, confirm, select, spinner, log } from 'termui/clack';
```

**Key exports:** `intro`, `outro`, `text`, `confirm`, `select`, `multiselect`, `spinner`, `group`, `tasks`, `log`, `cancel`, `CancelError`

```ts
import { intro, outro, text, confirm, spinner } from 'termui/clack';

intro('Deploy Tool');
const name = await text({ message: 'Project name?', placeholder: 'my-app' });
const ok = await confirm({ message: `Deploy ${name}?` });
if (ok) {
  const s = spinner();
  s.start('Deploying…');
  await deploy(name);
  s.stop('Done');
}
outro('Deployment complete');
```

---

## `termui/clack-ink`

Ink-rendered variants of the clack prompts. Uses React + Ink + TermUI components to render interactive `Select` and `Confirm` prompts inside an Ink app. Requires `termui`, `ink`, and `react`.

```ts
import { selectInk, confirmInk } from 'termui/clack-ink';
```

**Key exports:** `selectInk`, `confirmInk`

```ts
import { selectInk, confirmInk } from 'termui/clack-ink';

const env = await selectInk({
  message: 'Choose environment',
  options: [
    { value: 'dev', label: 'Development' },
    { value: 'production', label: 'Production', hint: 'careful!' },
  ],
});

const confirmed = await confirmInk({ message: `Deploy to ${env}?`, initialValue: false });
```

---

## `termui/picocolors`

Picocolors-compatible color API. Built-in implementation; exports a `pc` object with modifiers and foreground/background color functions. Respects `NO_COLOR`, `FORCE_COLOR`, and `CLICOLOR`. Extended with `hex()` and `ansi256()` beyond the picocolors baseline.

```ts
import { pc } from 'termui/picocolors';
```

**Key exports:** `pc` (default + named)

```ts
import { pc } from 'termui/picocolors';

console.log(pc.bold(pc.cyan('TermUI')));
console.log(pc.red('error') + ' ' + pc.dim('details'));
console.log(pc.bgGreen(pc.white(' OK ')));
console.log(pc.hex('#ff6600')('custom orange'));
```

---

## `termui/gray-matter`

Frontmatter parser compatible with the `gray-matter` API. Built-in zero-dependency implementation for simple YAML frontmatter. Use `matterWithYaml` for full YAML support (requires optional peer `yaml`).

```ts
import { matter, matterWithYaml } from 'termui/gray-matter';
```

**Key exports:** `matter`, `matterWithYaml`, `GrayMatterResult`

```ts
import { matter, matterWithYaml } from 'termui/gray-matter';

const src = `---
title: Hello World
published: true
tags: [ts, cli]
---
Body content here.`;

const { data, content } = matter(src);
console.log(data.title); // 'Hello World'
console.log(content); // 'Body content here.'

// Full YAML (requires: npm install yaml)
const result = await matterWithYaml(src);
```

---

## `termui/args`

Lightweight CLI builder with styled help output. Provides `createCLI` / `createMinimalCLI` for defining commands and parsing `process.argv`, `createCLIv2` for action handlers + middleware, and output helpers.

```ts
import { createCLI, createCLIv2, createOutput, withGracefulExit } from 'termui/args';
```

**Key exports:** `createCLI`, `createMinimalCLI`, `createCLIv2`, `createOutput`, `withGracefulExit`, `onCleanup`, `applyYargsStyledHelp`, `CLIConfig`, `CLICommand`

```ts
import { createCLI } from 'termui/args';

const cli = createCLI({
  name: 'mycli',
  version: '1.0.0',
  description: 'My CLI tool',
  commands: {
    build: {
      name: 'build',
      description: 'Build the project',
      args: { out: { description: 'Output dir', default: 'dist' } },
    },
  },
});

const result = cli.parse();
if (result) console.log(result.command, result.args);
```

---

## `termui/completion`

Generates bash, zsh, and fish shell completion scripts from a `CLIConfig` (compatible with `termui/args`). Wire the output to a `completion` subcommand in your CLI.

```ts
import {
  generateBashCompletion,
  generateZshCompletion,
  generateFishCompletion,
} from 'termui/completion';
```

**Key exports:** `generateBashCompletion`, `generateZshCompletion`, `generateFishCompletion`, `CompletionConfig`

```ts
import { generateBashCompletion, generateZshCompletion } from 'termui/completion';

const config = {
  name: 'mycli',
  version: '1.0.0',
  commands: { build: { name: 'build', description: 'Build' } },
  subcommandCompletions: { add: ['spinner', 'table', 'select'] },
};

// In your CLI's "completion" command handler:
if (process.argv[3] === 'bash') process.stdout.write(generateBashCompletion(config));
if (process.argv[3] === 'zsh') process.stdout.write(generateZshCompletion(config));
```

---

## `termui/link`

Generates OSC 8 terminal hyperlinks (same API as the `terminal-link` package). Falls back to `text (url)` when colors are disabled or the terminal does not support OSC 8.

```ts
import { terminalLink } from 'termui/link';
```

**Key exports:** `terminalLink`

```ts
import { terminalLink } from 'termui/link';

const link = terminalLink('TermUI Docs', 'https://github.com/arindam200/termui');
console.log(`Visit ${link} to get started.`);

// In a non-OSC-8 terminal the output degrades to:
// Visit TermUI Docs (https://github.com/arindam200/termui) to get started.
```

---

## `termui/git`

React hook and utility functions for reading git repository state via `simple-git`. Requires the `simple-git` peer dependency.

```sh
npm install simple-git
```

```ts
import { useGit, getGitBranches, getGitStatusShort } from 'termui/git';
```

**Key exports:** `useGit`, `getGitBranches`, `getGitStatusShort`, `UseGitState`

```ts
import { useGit } from 'termui/git';

function GitInfo() {
  const { branch, status, loading, error } = useGit(process.cwd());
  if (loading) return <Text>Loading…</Text>;
  if (error)   return <Text color="red">{error.message}</Text>;
  return <Text>Branch: {branch} — {status?.modified.length} modified</Text>;
}
```

---

## `termui/github`

React hook and imperative helper for loading the GitHub REST API client via `@octokit/rest`. The hook handles async loading state; `createOctokit` is the imperative variant. Requires the `@octokit/rest` peer dependency.

```sh
npm install @octokit/rest
```

```ts
import { useGitHub, createOctokit } from 'termui/github';
```

**Key exports:** `useGitHub`, `createOctokit`

```ts
import { useGitHub } from 'termui/github';

function RepoList() {
  const { octokit, loading, error } = useGitHub(process.env.GITHUB_TOKEN);
  if (loading) return <Text>Authenticating…</Text>;
  if (error)   return <Text color="red">{error.message}</Text>;
  // octokit is a fully-typed Octokit instance
  return <Text>GitHub client ready</Text>;
}
```

---

## `termui/keychain`

React hook for OS keychain access via `keytar`. Gracefully degrades when `keytar` is not installed. Requires the `keytar` peer dependency (native module — must be rebuilt per Node version).

```sh
npm install keytar
```

```ts
import { useKeychain, loadKeytar } from 'termui/keychain';
```

**Key exports:** `useKeychain`, `loadKeytar`, `KeytarModule`

```ts
import { useKeychain } from 'termui/keychain';

function TokenManager() {
  const { available, get, set, del } = useKeychain('my-cli');
  if (!available) return <Text dim>Keychain unavailable</Text>;

  const handleSave = async () => {
    await set('github-token', 'ghp_…');
  };
  return <Text>Keychain ready — <Text onPress={handleSave}>Save token</Text></Text>;
}
```

---

## `termui/pty`

Spawns a pseudo-terminal process via `node-pty` and exposes its streaming output as a React hook. `spawnPty` returns `null` (rather than throwing) when `node-pty` is unavailable. Requires the `node-pty` peer dependency (native module).

```sh
npm install node-pty
```

```ts
import { spawnPty, usePtyOutput } from 'termui/pty';
```

**Key exports:** `spawnPty`, `usePtyOutput`, `IPty`

```ts
import { usePtyOutput } from 'termui/pty';

function ShellOutput() {
  const { text, error } = usePtyOutput('bash', ['-c', 'ls -la'], {
    cols: 120, rows: 40, cwd: process.cwd(),
  });
  if (error) return <Text color="red">{error}</Text>;
  return <Text>{text}</Text>;
}
```

---

## `termui/vue`

Vue 3 type bridge. Re-exports all TermUI prop type interfaces from `@termui/types` for use in Vue component type annotations, plus two Vue 3 composition API helpers: `useTerminalSize` (reactive terminal dimensions) and `useThemeTokens` (theme context).

```ts
import type { SpinnerProps, Theme } from 'termui/vue';
import { useTerminalSize, useThemeTokens } from 'termui/vue';
```

**Key exports:** all `@termui/types` interfaces (type-only re-exports), `useTerminalSize`, `useThemeTokens`, `TERMUI_THEME_KEY`

```ts
import type { SelectProps, TableProps } from 'termui/vue';
import { useTerminalSize } from 'termui/vue';

// In a Vue 3 <script setup> block:
const { columns, rows } = useTerminalSize();
// columns and rows are Vue refs that update on terminal resize
```

---

## `termui/svelte`

Svelte 5 type bridge and rune-based composables. Re-exports all TermUI prop type interfaces from `@termui/types` for use in Svelte component type annotations. The rune-based composables (`terminalSize`, `themeTokens`) live in `.svelte.ts` sibling files and require the Svelte compiler.

```ts
import type { SpinnerProps, Theme } from 'termui/svelte';
```

**Key exports:** all `@termui/types` interfaces (type-only re-exports); `terminalSize()` and `themeTokens()` rune composables in the `.svelte.ts` sibling files

```svelte
<script lang="ts">
  import type { SelectProps } from 'termui/svelte';
  import { terminalSize } from 'termui/svelte';

  const size = terminalSize();
  // size.columns and size.rows are reactive via Svelte 5 $state runes
</script>

<p>Terminal: {size.columns} × {size.rows}</p>
```

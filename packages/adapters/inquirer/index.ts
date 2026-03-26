/**
 * termui/inquirer — inquirer-compatible prompts API.
 * Built-in implementation using readline + ANSI.
 * Optional peer: inquirer >=9.0.0 (if installed, routes to native inquirer)
 */

import * as readline from 'readline';

// ---------------------------------------------------------------------------
// ANSI helpers (mirrors the palette used across other adapters)
// ---------------------------------------------------------------------------
const ansi = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  reset: '\x1b[0m',
};

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface InquirerChoice {
  name: string;
  value: unknown;
  short?: string;
}

export interface InquirerInput {
  type: 'input' | 'password' | 'confirm' | 'list' | 'checkbox' | 'rawlist' | 'number';
  name: string;
  message: string;
  default?: unknown;
  choices?: Array<string | InquirerChoice>;
  validate?: (input: unknown) => boolean | string | Promise<boolean | string>;
  filter?: (input: unknown) => unknown;
  when?: boolean | ((answers: Record<string, unknown>) => boolean);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Normalise a choices array to always be InquirerChoice objects. */
function normaliseChoices(choices: Array<string | InquirerChoice>): InquirerChoice[] {
  return choices.map((c) => (typeof c === 'string' ? { name: c, value: c } : c));
}

/** Create a readline interface bound to the process stdio pair. */
function createRl(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Ask a single readline question and resolve with the raw answer string.
 * Closes the interface automatically.
 */
function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
    rl.on('error', reject);
  });
}

/**
 * Run the user-supplied validate function and return an error message string
 * or null if valid.
 */
async function runValidate(
  validate: NonNullable<InquirerInput['validate']>,
  value: unknown
): Promise<string | null> {
  const result = await validate(value);
  if (result === true || result === '') return null;
  if (typeof result === 'string') return result;
  return 'Invalid value.';
}

// ---------------------------------------------------------------------------
// Per-type handlers
// ---------------------------------------------------------------------------

async function handleInput(q: InquirerInput): Promise<string> {
  const defaultSuffix = q.default !== undefined ? ansi.dim(` (${q.default})`) : '';
  const promptStr = `${ansi.cyan('?')} ${ansi.bold(q.message)}${defaultSuffix} `;

  while (true) {
    const rl = createRl();
    const raw = await ask(rl, promptStr);
    const value = raw.trim() !== '' ? raw.trim() : ((q.default as string | undefined) ?? '');

    if (q.validate) {
      const err = await runValidate(q.validate, value);
      if (err) {
        console.log(`  ${ansi.red('>>')} ${ansi.red(err)}`);
        continue;
      }
    }

    const filtered = q.filter ? (q.filter(value) as string) : value;
    console.log(`${ansi.green('?')} ${ansi.bold(q.message)} ${ansi.cyan(String(filtered))}`);
    return filtered;
  }
}

async function handleNumber(q: InquirerInput): Promise<number> {
  const defaultSuffix = q.default !== undefined ? ansi.dim(` (${q.default})`) : '';
  const promptStr = `${ansi.cyan('?')} ${ansi.bold(q.message)}${defaultSuffix} `;

  while (true) {
    const rl = createRl();
    const raw = await ask(rl, promptStr);
    const trimmed = raw.trim();
    const value = trimmed !== '' ? parseFloat(trimmed) : ((q.default as number | undefined) ?? NaN);

    if (Number.isNaN(value)) {
      console.log(`  ${ansi.red('>>')} ${ansi.red('Please enter a valid number.')}`);
      continue;
    }

    if (q.validate) {
      const err = await runValidate(q.validate, value);
      if (err) {
        console.log(`  ${ansi.red('>>')} ${ansi.red(err)}`);
        continue;
      }
    }

    const filtered = q.filter ? (q.filter(value) as number) : value;
    console.log(`${ansi.green('?')} ${ansi.bold(q.message)} ${ansi.cyan(String(filtered))}`);
    return filtered;
  }
}

async function handlePassword(q: InquirerInput): Promise<string> {
  const promptStr = `${ansi.cyan('?')} ${ansi.bold(q.message)} `;

  return new Promise((resolve, reject) => {
    const rl = createRl();
    // Mute stdout echo by patching _writeToOutput on the interface
    (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (
      stringToWrite: string
    ) => {
      // Only write the prompt itself, suppress keystroke echo
      if (stringToWrite && !stringToWrite.match(/^\r?\n?$/)) {
        if (
          stringToWrite.includes(q.message) ||
          stringToWrite.startsWith('\x1b') ||
          stringToWrite === promptStr
        ) {
          process.stdout.write(stringToWrite);
        }
        // Suppress character echoes — intentionally a no-op
      }
    };

    process.stdout.write(promptStr);

    rl.question('', (answer) => {
      rl.close();
      process.stdout.write('\n');
      console.log(`${ansi.green('?')} ${ansi.bold(q.message)} ${ansi.dim('[hidden]')}`);
      resolve(answer);
    });

    rl.on('error', reject);
  });
}

async function handleConfirm(q: InquirerInput): Promise<boolean> {
  const defaultVal = q.default !== false; // true unless explicitly false
  const hint = defaultVal ? 'Y/n' : 'y/N';
  const promptStr = `${ansi.cyan('?')} ${ansi.bold(q.message)} ${ansi.dim(`(${hint})`)} `;

  const rl = createRl();
  const raw = await ask(rl, promptStr);
  const trimmed = raw.trim().toLowerCase();

  let result: boolean;
  if (trimmed === '') {
    result = defaultVal;
  } else {
    result = trimmed === 'y' || trimmed === 'yes';
  }

  const display = result ? ansi.green('Yes') : ansi.red('No');
  console.log(`${ansi.green('?')} ${ansi.bold(q.message)} ${display}`);
  return result;
}

async function handleList(q: InquirerInput): Promise<unknown> {
  const choices = normaliseChoices(q.choices ?? []);
  console.log(`\n${ansi.cyan('?')} ${ansi.bold(q.message)}`);
  choices.forEach((c, i) => {
    console.log(`  ${ansi.dim(`${i + 1}.`)} ${c.name}`);
  });

  // Determine the 1-based default index
  let defaultIdx: number | undefined;
  if (q.default !== undefined) {
    const found = choices.findIndex((c) => c.value === q.default || c.name === q.default);
    if (found !== -1) defaultIdx = found + 1;
  }

  const defaultSuffix = defaultIdx !== undefined ? ansi.dim(` (default: ${defaultIdx})`) : '';
  const promptStr = `${ansi.dim('›')} Enter number${defaultSuffix}: `;

  while (true) {
    const rl = createRl();
    const raw = await ask(rl, promptStr);
    const trimmed = raw.trim();
    const n = trimmed !== '' ? parseInt(trimmed, 10) : (defaultIdx ?? NaN);

    const choice = choices[n - 1];
    if (!choice) {
      console.log(
        `  ${ansi.red('>>')} ${ansi.red(`Please enter a number between 1 and ${choices.length}.`)}`
      );
      continue;
    }

    const filtered = q.filter ? q.filter(choice.value) : choice.value;
    console.log(
      `${ansi.green('?')} ${ansi.bold(q.message)} ${ansi.cyan(choice.short ?? choice.name)}`
    );
    return filtered;
  }
}

/** rawlist is identical to list in this built-in implementation. */
const handleRawlist = handleList;

async function handleCheckbox(q: InquirerInput): Promise<unknown[]> {
  const choices = normaliseChoices(q.choices ?? []);
  console.log(`\n${ansi.cyan('?')} ${ansi.bold(q.message)}`);
  console.log(ansi.dim('  (comma-separated numbers, e.g. 1,3)'));
  choices.forEach((c, i) => {
    console.log(`  ${ansi.dim(`${i + 1}.`)} ${c.name}`);
  });

  while (true) {
    const rl = createRl();
    const raw = await ask(rl, `${ansi.dim('›')} `);

    if (raw.trim() === '' && q.default !== undefined) {
      const defaultArr = Array.isArray(q.default) ? q.default : [q.default];
      console.log(`${ansi.green('?')} ${ansi.bold(q.message)} ${ansi.cyan(String(defaultArr))}`);
      return defaultArr;
    }

    const parts = raw
      .split(/[,\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));

    const picked: unknown[] = [];
    let invalid = false;
    for (const n of parts) {
      const c = choices[n - 1];
      if (!c) {
        console.log(`  ${ansi.red('>>')} ${ansi.red(`${n} is not a valid choice.`)}`);
        invalid = true;
        break;
      }
      picked.push(q.filter ? q.filter(c.value) : c.value);
    }

    if (invalid) continue;

    const labels = parts.map((n) => choices[n - 1]?.name ?? n).join(', ');
    console.log(`${ansi.green('?')} ${ansi.bold(q.message)} ${ansi.cyan(`[${labels}]`)}`);
    return picked;
  }
}

// ---------------------------------------------------------------------------
// Core prompt() implementation
// ---------------------------------------------------------------------------

async function runQuestion(q: InquirerInput, answers: Record<string, unknown>): Promise<unknown> {
  // Evaluate `when` guard
  if (q.when !== undefined) {
    const active = typeof q.when === 'function' ? q.when(answers) : q.when;
    if (!active) return undefined;
  }

  switch (q.type) {
    case 'input':
      return handleInput(q);
    case 'number':
      return handleNumber(q);
    case 'password':
      return handlePassword(q);
    case 'confirm':
      return handleConfirm(q);
    case 'list':
      return handleList(q);
    case 'rawlist':
      return handleRawlist(q);
    case 'checkbox':
      return handleCheckbox(q);
    default:
      // Fallback for unknown types: treat as input
      return handleInput(q);
  }
}

/**
 * `inquirer.prompt()` — accepts a single question or an array of questions and
 * returns a plain object whose keys are the `name` fields.
 *
 * Compatible with inquirer@9 call signature.
 */
export async function prompt(
  questions: InquirerInput | InquirerInput[]
): Promise<Record<string, unknown>> {
  const list = Array.isArray(questions) ? questions : [questions];
  const answers: Record<string, unknown> = {};

  for (const q of list) {
    const value = await runQuestion(q, answers);
    if (value !== undefined) {
      answers[q.name] = value;
    }
  }

  return answers;
}

// ---------------------------------------------------------------------------
// Ergonomic named helpers
// ---------------------------------------------------------------------------

/** Prompt for a text string. */
export async function input(opts: {
  message: string;
  default?: string;
  validate?: (v: string) => boolean | string | Promise<boolean | string>;
}): Promise<string> {
  return handleInput({
    type: 'input',
    name: '__input__',
    message: opts.message,
    default: opts.default,
    validate: opts.validate as InquirerInput['validate'],
  });
}

/** Prompt for a hidden password string. */
export async function password(opts: { message: string }): Promise<string> {
  return handlePassword({
    type: 'password',
    name: '__password__',
    message: opts.message,
  });
}

/** Prompt for a boolean yes/no answer. */
export async function confirm(opts: { message: string; default?: boolean }): Promise<boolean> {
  return handleConfirm({
    type: 'confirm',
    name: '__confirm__',
    message: opts.message,
    default: opts.default,
  });
}

/** Prompt for a single selection from a list. */
export async function select(opts: {
  message: string;
  choices: Array<string | { name: string; value: unknown; short?: string }>;
  default?: unknown;
}): Promise<unknown> {
  return handleList({
    type: 'list',
    name: '__select__',
    message: opts.message,
    choices: opts.choices,
    default: opts.default,
  });
}

// ---------------------------------------------------------------------------
// Default export — mirrors the inquirer@9 default export shape
// ---------------------------------------------------------------------------
export default { prompt, input, password, confirm, select };

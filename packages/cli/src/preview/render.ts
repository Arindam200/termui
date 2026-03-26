/**
 * ANSI rendering engine for `npx termui preview`.
 * No Ink dependency — uses raw stdout + readline keyboard handling.
 */

import type { Category, ComponentEntry, PropDef } from './catalog.js';

// ── ANSI helpers ────────────────────────────────────────────────────────────

export const ansi = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  red: '\x1b[31m',
  white: '\x1b[97m',
  bgMagenta: '\x1b[45m',
  clearScreen: '\x1b[2J\x1b[H',
  hideCursor: '\x1b[?25l',
  showCursor: '\x1b[?25h',
  move: (row: number, col: number) => `\x1b[${row};${col}H`,
  clearLine: '\x1b[2K',
};

// ── String utils ─────────────────────────────────────────────────────────────

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

export function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*[mGKHJ]/g, '');
}

/** Pad a string (which may contain ANSI codes) to a visible width. */
function pad(str: string, width: number): string {
  const visible = stripAnsi(str).length;
  const needed = Math.max(0, width - visible);
  return str + ' '.repeat(needed);
}

// ── Box drawing ──────────────────────────────────────────────────────────────

const B = {
  tl: '╭',
  tr: '╮',
  bl: '╰',
  br: '╯',
  h: '─',
  v: '│',
  djoin: '┬',
  djoin_b: '┴',
};

function hline(n: number) {
  return B.h.repeat(n);
}

// ── Syntax highlighter for JSX/TSX usage snippets ────────────────────────────

function highlight(line: string): string {
  // Keywords
  line = line.replace(
    /\b(import|export|from|const|let|var|return|function|async|await|true|false|null|undefined)\b/g,
    `${ansi.magenta}$1${ansi.reset}`
  );
  // String literals (single or double quoted)
  line = line.replace(/(['"])(.*?)\1/g, `${ansi.yellow}$1$2$1${ansi.reset}`);
  // JSX opening tags  <ComponentName
  line = line.replace(/(<\/?)([\w]+)/g, `${ansi.gray}$1${ansi.cyan}$2${ansi.reset}`);
  // JSX prop names (word before = inside a tag context)
  line = line.replace(/\b([a-z][a-zA-Z]*)(?==)/g, `${ansi.green}$1${ansi.reset}`);
  // Numeric values
  line = line.replace(/\{(\d+)\}/g, `${ansi.gray}{${ansi.blue}$1${ansi.gray}}${ansi.reset}`);
  // JSX closing > and />
  line = line.replace(/(\/?>)/g, `${ansi.gray}$1${ansi.reset}`);
  return line;
}

// ── Layout constants ─────────────────────────────────────────────────────────

export const HEADER_ROWS = 2;
export const FOOTER_ROWS = 2;
export const LEFT_W = 22; // width of left panel including borders

// ── State ────────────────────────────────────────────────────────────────────

export interface PreviewState {
  categories: Category[];
  catIndex: number;
  compIndex: number;
  mode: 'list' | 'detail' | 'playground';
  scrollOffset: number;
  detailScroll: number;
  // playground
  playProps: Record<string, string>;
  playPropIndex: number; // index into editableProps array
  playEditing: boolean; // true when cursor is in text-edit mode
  playEditBuffer: string; // live keystroke buffer while editing
  playScroll: number; // vertical scroll offset for playground panel
  // search
  searchMode: boolean; // true when search bar is active
  searchQuery: string; // current query string
  /** Flat list of matches across all categories, populated when searchQuery != '' */
  searchResults: Array<{ catIndex: number; compIndex: number; comp: ComponentEntry }>;
  searchResultIndex: number; // selected index within searchResults
}

// ── Search helpers ────────────────────────────────────────────────────────────

/** Case-insensitive substring check; returns true when every character of the
 *  query appears in order inside `target` (fuzzy), or as a plain substring. */
function fuzzyMatch(target: string, query: string): boolean {
  if (!query) return true;
  const t = target.toLowerCase();
  const q = query.toLowerCase();
  // First try plain substring (faster and more intuitive for short queries)
  if (t.includes(q)) return true;
  // Fuzzy: every char of q must appear in order inside t
  let ti = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi]!;
    const found = t.indexOf(ch, ti);
    if (found === -1) return false;
    ti = found + 1;
  }
  return true;
}

/**
 * Highlight query characters inside a display string using ANSI bold+cyan.
 * Uses plain substring highlighting for readability.
 */
function highlightMatch(text: string, query: string): string {
  if (!query) return text;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + q.length);
  const after = text.slice(idx + q.length);
  return `${before}${ansi.bold}${ansi.cyan}${match}${ansi.reset}${after}`;
}

/** Rebuild search results from all categories based on current query. */
export function buildSearchResults(
  categories: Category[],
  query: string
): PreviewState['searchResults'] {
  if (!query) return [];
  const results: PreviewState['searchResults'] = [];
  for (let ci = 0; ci < categories.length; ci++) {
    const cat = categories[ci]!;
    for (let ki = 0; ki < cat.components.length; ki++) {
      const comp = cat.components[ki]!;
      if (fuzzyMatch(comp.name, query) || fuzzyMatch(comp.description, query)) {
        results.push({ catIndex: ci, compIndex: ki, comp });
      }
    }
  }
  return results;
}

// ── Main render ──────────────────────────────────────────────────────────────

export function render(state: PreviewState): void {
  const cols = Math.max(process.stdout.columns || 100, 60);
  const rows = Math.max(process.stdout.rows || 30, 12);
  const rightW = cols - LEFT_W; // right panel inner width
  const contentRows = rows - HEADER_ROWS - FOOTER_ROWS;

  const out: string[] = [ansi.clearScreen];

  // ── Header bar ──────────────────────────────────────────────────────────
  const title =
    `${ansi.bold}${ansi.magenta} TermUI ${ansi.reset}` +
    `${ansi.bold}${ansi.white}Preview${ansi.reset}` +
    `${ansi.dim}  v0.1.5${ansi.reset}`;
  const hints = state.searchMode
    ? `${ansi.dim}type to search  Enter=jump  Esc=clear  ↑↓ results${ansi.reset}`
    : state.mode === 'playground'
      ? state.playEditing
        ? `${ansi.dim}type to edit  Enter=confirm  Esc=cancel${ansi.reset}`
        : `${ansi.dim}↑↓ prop  Space/←→ toggle  Enter=edit  p/Esc=back${ansi.reset}`
      : `${ansi.dim}↑↓ navigate  →/Enter detail  p playground  / search  q quit${ansi.reset}`;
  out.push(ansi.move(1, 1) + pad(title, cols - stripAnsi(hints).length) + hints);

  // top border
  out.push(
    ansi.move(2, 1) +
      ansi.gray +
      B.tl +
      hline(LEFT_W - 2) +
      B.djoin +
      hline(rightW - 1) +
      B.tr +
      ansi.reset
  );

  // ── Left panel + right panel rows ───────────────────────────────────────
  const cat = state.categories[state.catIndex];

  for (let r = 0; r < contentRows; r++) {
    const leftCell = renderLeftRow(state, r);
    const rightCell =
      state.mode === 'playground'
        ? renderPlaygroundRow(state, r, rightW)
        : state.mode === 'list'
          ? renderListRow(state, r, rightW)
          : renderDetailRow(state, r, rightW);

    out.push(ansi.move(HEADER_ROWS + 1 + r, 1) + leftCell + rightCell);
  }

  // bottom border
  out.push(
    ansi.move(HEADER_ROWS + contentRows + 1, 1) +
      ansi.gray +
      B.bl +
      hline(LEFT_W - 2) +
      B.djoin_b +
      hline(rightW - 1) +
      B.br +
      ansi.reset
  );

  // ── Status / breadcrumb bar ──────────────────────────────────────────────
  const comp = cat?.components[state.compIndex];

  if (state.searchMode || state.searchQuery) {
    // Search bar occupies the footer row
    const totalComps = state.categories.reduce((n, c) => n + c.components.length, 0);
    const matchCount = state.searchResults.length;
    const countStr = state.searchQuery
      ? `  ${ansi.dim}${matchCount} of ${totalComps} components${ansi.reset}`
      : '';
    const cursor = state.searchMode ? `${ansi.bold}${ansi.cyan}▌${ansi.reset}` : '';
    const bar =
      ` ${ansi.bold}${ansi.yellow}/${ansi.reset}  ` +
      `${ansi.white}${state.searchQuery}${ansi.reset}` +
      cursor +
      countStr;
    out.push(ansi.move(rows, 1) + ansi.clearLine + bar);
  } else {
    const catLabel = ansi.dim + (cat?.name ?? '') + ansi.reset;
    const compLabel =
      comp && state.mode !== 'list'
        ? ` ${ansi.gray}›${ansi.reset} ${ansi.cyan}${ansi.bold}${comp.name}${ansi.reset}`
        : '';
    const modeLabel =
      state.mode === 'playground' ? `  ${ansi.magenta}${ansi.bold}playground${ansi.reset}` : '';
    const propCount =
      comp && state.mode === 'detail'
        ? `  ${ansi.gray}${comp.props.length} props${ansi.reset}`
        : '';
    const scrollHint =
      state.mode === 'detail' && state.detailScroll > 0
        ? `  ${ansi.gray}↑ scroll${ansi.reset}`
        : '';
    out.push(
      ansi.move(rows, 1) +
        ansi.clearLine +
        ' ' +
        catLabel +
        compLabel +
        modeLabel +
        propCount +
        scrollHint
    );
  }

  process.stdout.write(out.join(''));
}

// ── Left panel ───────────────────────────────────────────────────────────────

function renderLeftRow(state: PreviewState, row: number): string {
  const entry = state.categories[row];
  const border = ansi.gray + B.v + ansi.reset;
  const divider = ansi.gray + '│' + ansi.reset;

  if (!entry) {
    return border + ' '.repeat(LEFT_W - 2) + divider;
  }

  const isActive = row === state.catIndex;
  const icon = isActive ? `${ansi.cyan}▸${ansi.reset}` : ' ';
  const name = truncate(entry.name, LEFT_W - 8);
  const nameStr = isActive
    ? `${ansi.bold}${ansi.cyan}${name}${ansi.reset}`
    : `${ansi.white}${name}${ansi.reset}`;
  const count = `${ansi.gray}(${entry.components.length})${ansi.reset}`;

  const inner = pad(`${icon} ${nameStr} ${count}`, LEFT_W - 2);
  return border + inner + divider;
}

// ── List mode (right panel) ───────────────────────────────────────────────────

function renderListRow(state: PreviewState, row: number, width: number): string {
  const innerW = width - 2;

  // ── Search results mode ──────────────────────────────────────────────────
  if (state.searchQuery) {
    const results = state.searchResults;

    // Row 0: heading
    if (row === 0) {
      const totalComps = state.categories.reduce((n, c) => n + c.components.length, 0);
      const heading =
        `  ${ansi.bold}${ansi.yellow}Search${ansi.reset}` +
        `  ${ansi.dim}${results.length} of ${totalComps} components${ansi.reset}`;
      return pad(heading, innerW) + ' ';
    }

    // Row 1: thin rule
    if (row === 1) {
      return ansi.gray + ' ' + hline(innerW - 1) + ansi.reset + ' ';
    }

    if (row === 2) {
      const h = `  ${ansi.dim}Component${ansi.reset}`;
      return pad(h, innerW) + ' ';
    }

    if (results.length === 0) {
      if (row === 3) {
        return pad(`  ${ansi.dim}No matches${ansi.reset}`, innerW) + ' ';
      }
      return ' '.repeat(width - 1);
    }

    const resultRow = row - 3 + state.scrollOffset;
    const result = results[resultRow];
    if (!result) return ' '.repeat(width - 1);

    const isActive = resultRow === state.searchResultIndex;
    const cat = state.categories[result.catIndex];
    const catName = cat ? `${ansi.gray}${cat.name}${ansi.reset}` : '';

    if (isActive) {
      const cursor = `${ansi.cyan}▶${ansi.reset}`;
      const name = highlightMatch(result.comp.name, state.searchQuery);
      const nameStyled = `${ansi.bold}${ansi.white}${name}${ansi.reset}`;
      const descRaw = truncate(result.comp.description, innerW - result.comp.name.length - 14);
      const desc = ansi.dim + highlightMatch(descRaw, state.searchQuery) + ansi.reset;
      const inner = `${cursor} ${nameStyled}  ${catName}  ${desc}`;
      return pad(inner, innerW) + ' ';
    } else {
      const name = `${ansi.white}${result.comp.name}${ansi.reset}`;
      const descRaw = truncate(result.comp.description, innerW - result.comp.name.length - 14);
      const desc = ansi.gray + descRaw + ansi.reset;
      return pad(`  ${name}  ${catName}  ${desc}`, innerW) + ' ';
    }
  }

  // ── Normal category list mode ─────────────────────────────────────────────
  const cat = state.categories[state.catIndex];
  if (!cat) return ' '.repeat(width - 1);

  const comps = cat.components;

  // Row 0: category heading bar
  if (row === 0) {
    const heading =
      `  ${ansi.bold}${ansi.yellow}${cat.name}${ansi.reset}` +
      `  ${ansi.dim}${comps.length} component${comps.length !== 1 ? 's' : ''}${ansi.reset}`;
    return pad(heading, innerW) + ' ';
  }

  // Row 1: thin rule
  if (row === 1) {
    return ansi.gray + ' ' + hline(innerW - 1) + ansi.reset + ' ';
  }

  // Row 2: column headers
  if (row === 2) {
    const h = `  ${ansi.dim}Component${ansi.reset}`;
    return pad(h, innerW) + ' ';
  }

  const compRow = row - 3 + state.scrollOffset;
  const comp = comps[compRow];
  if (!comp) return ' '.repeat(width - 1);

  const isActive = compRow === state.compIndex;

  if (isActive) {
    // Active item: two-line treatment (but we only have one row slot)
    const cursor = `${ansi.cyan}▶${ansi.reset}`;
    const name = `${ansi.bold}${ansi.white}${comp.name}${ansi.reset}`;
    const desc = ansi.dim + truncate(comp.description, innerW - comp.name.length - 6) + ansi.reset;
    const inner = `${cursor} ${name}  ${desc}`;
    return pad(inner, innerW) + ' ';
  } else {
    const name = `${ansi.white}${comp.name}${ansi.reset}`;
    const desc = ansi.gray + truncate(comp.description, innerW - comp.name.length - 6) + ansi.reset;
    return pad(`  ${name}  ${desc}`, innerW) + ' ';
  }
}

// ── Detail mode (right panel) ────────────────────────────────────────────────

function renderDetailRow(state: PreviewState, row: number, width: number): string {
  const cat = state.categories[state.catIndex];
  const comp: ComponentEntry | undefined = cat?.components[state.compIndex];
  if (!comp) return ' '.repeat(width - 1);

  const lines = buildDetailLines(comp, width);
  const lineIdx = row + state.detailScroll;
  const line = lines[lineIdx] ?? '';
  return pad(line, width - 2);
}

// ── Boxed section helper ──────────────────────────────────────────────────────

function sectionBox(title: string, titleColor: string, body: string[], innerW: number): string[] {
  const lines: string[] = [];
  const titleStr = titleColor + title + ansi.reset;
  const titleVisible = title.length;
  const dashCount = Math.max(0, innerW - titleVisible - 4);
  const topBorder =
    ansi.gray +
    ' ' +
    B.tl +
    B.h +
    ansi.reset +
    ' ' +
    titleStr +
    ' ' +
    ansi.gray +
    hline(dashCount) +
    B.tr +
    ansi.reset;
  lines.push(topBorder);

  for (const l of body) {
    lines.push(ansi.gray + ' ' + B.v + ansi.reset + ' ' + l);
  }

  lines.push(ansi.gray + ' ' + B.bl + hline(innerW - 1) + B.br + ansi.reset);
  return lines;
}

// ── Playground helpers ────────────────────────────────────────────────────────

/** Props that can be interactively edited (excludes children, callbacks, ReactNode) */
export function editableProps(comp: ComponentEntry): PropDef[] {
  return comp.props.filter((p) => {
    if (p.name === 'children') return false;
    const t = p.type;
    if (t.includes('ReactNode') || t.includes('=>') || t.startsWith('(')) return false;
    return true;
  });
}

/** Classify a prop's type for editing behaviour */
export function getPropKind(type: string): 'boolean' | 'number' | 'string' | 'enum' {
  const t = type.trim();
  if (t === 'boolean') return 'boolean';
  if (t === 'number') return 'number';
  if (t.includes("'") || t.includes('"')) return 'enum';
  return 'string';
}

/** Parse the enum union type into individual values */
export function getEnumValues(type: string): string[] {
  return type
    .split('|')
    .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

/** Derive initial playground prop values from catalog defaults */
export function initPlayProps(comp: ComponentEntry): Record<string, string> {
  const vals: Record<string, string> = {};
  for (const prop of editableProps(comp)) {
    if (prop.default !== undefined) {
      // Strip surrounding quotes from string defaults like "'dots'" → "dots"
      vals[prop.name] = prop.default.replace(/^['"]|['"]$/g, '');
    } else {
      const kind = getPropKind(prop.type);
      if (kind === 'boolean') vals[prop.name] = 'false';
      else if (kind === 'number') vals[prop.name] = '0';
      else if (kind === 'enum') vals[prop.name] = getEnumValues(prop.type)[0] ?? '';
      else vals[prop.name] = '';
    }
  }
  return vals;
}

/** Format a single prop value as a JSX attribute string */
function formatJsxAttr(prop: PropDef, value: string): string {
  const kind = getPropKind(prop.type);
  if (kind === 'boolean') {
    return value === 'true' ? prop.name : `${prop.name}={false}`;
  }
  if (kind === 'number') {
    return `${prop.name}={${value || '0'}}`;
  }
  // string or enum
  return `${prop.name}="${value}"`;
}

/** Build the live JSX code lines from current playground prop values */
function buildLiveCode(comp: ComponentEntry, playProps: Record<string, string>): string[] {
  const attrs = editableProps(comp)
    .filter((p) => {
      const v = playProps[p.name] ?? '';
      const kind = getPropKind(p.type);
      // Hide false booleans and empty strings to keep the snippet clean
      if (kind === 'boolean' && v === 'false') return false;
      if (kind !== 'boolean' && v === '') return false;
      return true;
    })
    .map((p) => `  ${formatJsxAttr(p, playProps[p.name] ?? '')}`);

  if (attrs.length === 0) return [`<${comp.name} />`];

  return [`<${comp.name}`, ...attrs, '/>'];
}

// ── Playground renderer ───────────────────────────────────────────────────────

function renderPlaygroundRow(state: PreviewState, row: number, width: number): string {
  const cat = state.categories[state.catIndex];
  const comp = cat?.components[state.compIndex];
  if (!comp) return ' '.repeat(width - 1);

  const lines = buildPlaygroundLines(comp, state, width);
  const line = lines[row + state.playScroll] ?? '';
  return pad(line, width - 2) + ' ';
}

function buildPlaygroundLines(
  comp: ComponentEntry,
  state: PreviewState,
  totalWidth: number
): string[] {
  const innerW = totalWidth - 4;
  const lines: string[] = [];
  const eProps = editableProps(comp);

  // ── Header ───────────────────────────────────────────────────────────────
  lines.push('');
  lines.push(
    `  ${ansi.bold}${ansi.white}${comp.name}${ansi.reset}` +
      `  ${ansi.magenta}Props Playground${ansi.reset}` +
      `  ${ansi.dim}${eProps.length} editable${ansi.reset}`
  );
  lines.push(`  ${ansi.gray}${'─'.repeat(innerW - 1)}${ansi.reset}`);
  lines.push('');

  // ── Prop rows ─────────────────────────────────────────────────────────────
  if (eProps.length === 0) {
    lines.push(`  ${ansi.dim}No editable props.${ansi.reset}`);
  } else {
    const nameW = Math.min(Math.max(...eProps.map((p) => p.name.length)) + 1, 22);
    const valW = Math.min(24, innerW - nameW - 10);

    for (let i = 0; i < eProps.length; i++) {
      const prop = eProps[i]!;
      const isActive = i === state.playPropIndex;
      const kind = getPropKind(prop.type);
      const rawVal = state.playProps[prop.name] ?? '';

      // Cursor
      const cursor = isActive ? `${ansi.cyan}▶${ansi.reset}` : ' ';

      // Prop name
      const nameStr = isActive
        ? `${ansi.bold}${ansi.white}${prop.name.padEnd(nameW)}${ansi.reset}`
        : `${ansi.green}${prop.name.padEnd(nameW)}${ansi.reset}`;

      // Value display
      let valStr: string;
      if (isActive && state.playEditing && kind !== 'boolean' && kind !== 'enum') {
        // Show live edit buffer with cursor
        const buf = truncate(state.playEditBuffer, valW - 2);
        valStr = `${ansi.yellow}${buf}${ansi.reset}${ansi.bold}${ansi.cyan}▌${ansi.reset}`;
      } else if (kind === 'boolean') {
        const isTrue = rawVal === 'true';
        valStr = isTrue ? `${ansi.green}true${ansi.reset}` : `${ansi.gray}false${ansi.reset}`;
        if (isActive) valStr += `  ${ansi.dim}[Space]${ansi.reset}`;
      } else if (kind === 'enum') {
        const vals = getEnumValues(prop.type);
        const cur = vals.indexOf(rawVal);
        const prev = cur > 0 ? `${ansi.dim}‹${ansi.reset}` : ' ';
        const next = cur < vals.length - 1 ? `${ansi.dim}›${ansi.reset}` : ' ';
        valStr = isActive
          ? `${prev} ${ansi.yellow}${rawVal}${ansi.reset} ${next}`
          : `${ansi.yellow}${rawVal}${ansi.reset}`;
      } else {
        // string / number
        const display = truncate(rawVal || ansi.dim + '(empty)', valW);
        valStr = `${ansi.yellow}${display}${ansi.reset}`;
        if (isActive && !state.playEditing) valStr += `  ${ansi.dim}[Enter]${ansi.reset}`;
      }

      // Type hint (shown dimly on right)
      const typeHint = `${ansi.gray}${truncate(prop.type, 14)}${ansi.reset}`;

      lines.push(`  ${cursor} ${nameStr}  ${valStr}    ${typeHint}`);
    }
  }

  lines.push('');

  // ── Live code section ─────────────────────────────────────────────────────
  const codeLines = buildLiveCode(comp, state.playProps);
  const codeBody = codeLines.map((l) => highlight(truncate(l, innerW - 4)));
  lines.push(...sectionBox('Live Code', ansi.cyan, codeBody, innerW));
  lines.push('');

  // ── Keyboard legend ───────────────────────────────────────────────────────
  if (!state.playEditing) {
    lines.push(`  ${ansi.dim}↑↓ move  Space toggle  ←→ cycle  Enter edit  p/Esc back${ansi.reset}`);
  }

  return lines;
}

// ── Build all detail lines ────────────────────────────────────────────────────

function buildDetailLines(comp: ComponentEntry, totalWidth: number): string[] {
  const innerW = totalWidth - 4; // usable line width inside sections
  const lines: string[] = [];

  // ── Component header ────────────────────────────────────────────────────
  lines.push('');
  lines.push(
    `  ${ansi.bold}${ansi.white}${comp.name}${ansi.reset}` +
      `  ${ansi.dim}${ansi.gray}${truncate(comp.description, innerW - comp.name.length - 4)}${ansi.reset}`
  );
  lines.push('');

  // ── Preview section ──────────────────────────────────────────────────────
  const previewBody: string[] = [];
  if (comp.preview && comp.preview.length > 0) {
    for (const pl of comp.preview) {
      previewBody.push(ansi.dim + truncate(pl, innerW - 2) + ansi.reset);
    }
  } else {
    // Generic fallback — show a wireframe box with the component name
    const cname = comp.name;
    const bw = Math.min(innerW - 4, 36);
    previewBody.push(ansi.gray + '  ╭' + hline(bw) + '╮' + ansi.reset);
    previewBody.push(
      ansi.gray +
        '  │' +
        ansi.reset +
        pad(`  ${ansi.white}${cname}${ansi.reset}`, bw + 20) +
        ansi.gray +
        '│' +
        ansi.reset
    );
    previewBody.push(ansi.gray + '  ╰' + hline(bw) + '╯' + ansi.reset);
  }
  lines.push(...sectionBox('Preview', ansi.green, previewBody, innerW));
  lines.push('');

  // ── Props section ────────────────────────────────────────────────────────
  if (comp.props.length > 0) {
    const nameWidth = Math.min(Math.max(...comp.props.map((p) => p.name.length)) + 1, 20);
    const typeWidth = Math.min(28, innerW - nameWidth - 10);

    const propBody = comp.props.map((prop) => {
      const req = prop.required ? `${ansi.red}*${ansi.reset}` : `${ansi.gray} ${ansi.reset}`;
      const name = ansi.green + prop.name.padEnd(nameWidth) + ansi.reset;
      const type = ansi.gray + truncate(prop.type, typeWidth).padEnd(typeWidth) + ansi.reset;
      const defVal = prop.default
        ? `  ${ansi.dim}= ${ansi.yellow}${prop.default}${ansi.reset}`
        : '';
      return `${req} ${name}  ${type}${defVal}`;
    });

    lines.push(...sectionBox('Props', ansi.yellow, propBody, innerW));
    lines.push('');
  }

  // ── Usage section ────────────────────────────────────────────────────────
  const usageBody = comp.usage.split('\n').map((l) => highlight(truncate(l, innerW - 2)));
  lines.push(...sectionBox('Usage', ansi.cyan, usageBody, innerW));
  lines.push('');

  return lines;
}

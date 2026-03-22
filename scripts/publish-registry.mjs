#!/usr/bin/env node
/**
 * publish-registry.mjs
 *
 * Syncs packages/components/src/ → registry/components/
 * and regenerates registry/schema.json + the embedded getLocalRegistry()
 * fallback in packages/cli/src/registry/client.ts.
 *
 * Run: node scripts/publish-registry.mjs
 */

import { existsSync, mkdirSync, copyFileSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ---------------------------------------------------------------------------
// Component manifest — single source of truth for registry metadata
// ---------------------------------------------------------------------------

const COMPONENTS = [
  // ── Phase 1 (already in registry, kept here so schema.json is complete) ──

  // Layout
  { name: 'box',          file: 'Box.tsx',          category: 'layout',     version: '0.1.0', description: 'Enhanced flexbox container with theme-aware borders', deps: [], peers: [] },
  { name: 'stack',        file: 'Stack.tsx',         category: 'layout',     version: '0.1.0', description: 'Vertical/horizontal stack with gap', deps: [], peers: [] },
  { name: 'grid',         file: 'Grid.tsx',          category: 'layout',     version: '0.1.0', description: 'Rows × columns grid layout', deps: [], peers: [] },
  { name: 'scroll-view',  file: 'ScrollView.tsx',    category: 'layout',     version: '0.1.0', description: 'Scrollable container with scrollbar', deps: [], peers: [] },

  // Typography
  { name: 'text',         file: 'Text.tsx',          category: 'typography', version: '0.1.0', description: 'Rich inline text with bold, italic, color, dim formatting', deps: [], peers: [] },
  { name: 'badge',        file: 'Badge.tsx',         category: 'typography', version: '0.1.0', description: 'Semantic status indicator badge (success/error/warning/info)', deps: [], peers: [] },

  // Input
  { name: 'text-input',   file: 'TextInput.tsx',     category: 'input',      version: '0.1.0', description: 'Single-line text input with placeholder, validation, mask', deps: [], peers: [] },

  // Selection
  { name: 'checkbox',     file: 'Checkbox.tsx',      category: 'selection',  version: '0.1.0', description: 'Checkbox with indeterminate state', deps: [], peers: [] },
  { name: 'select',       file: 'Select.tsx',        category: 'selection',  version: '0.1.0', description: 'Single-select dropdown with arrow-key navigation', deps: [], peers: [] },

  // Data
  { name: 'list',         file: 'List.tsx',          category: 'data',       version: '0.1.0', description: 'Navigable list with optional filtering', deps: [], peers: [] },
  { name: 'table',        file: 'Table.tsx',         category: 'data',       version: '0.1.0', description: 'Sortable, selectable, paginated data table', deps: [], peers: [] },

  // Feedback
  { name: 'spinner',      file: 'Spinner.tsx',       category: 'feedback',   version: '0.1.0', description: 'Animated spinner with 12+ styles', deps: [], peers: [] },
  { name: 'progress-bar', file: 'ProgressBar.tsx',   category: 'feedback',   version: '0.1.0', description: 'Determinate progress bar with percent and value/total display', deps: [], peers: [] },
  { name: 'alert',        file: 'Alert.tsx',         category: 'feedback',   version: '0.1.0', description: 'Alert box with success/error/warning/info variants', deps: [], peers: [] },

  // Navigation
  { name: 'tabs',         file: 'Tabs.tsx',          category: 'navigation', version: '0.1.0', description: 'Tab bar with left/right arrow and tab-key navigation', deps: [], peers: [] },

  // Overlays
  { name: 'modal',        file: 'Modal.tsx',         category: 'overlays',   version: '0.1.0', description: 'Focus-trapped overlay modal, close with Esc', deps: [], peers: [] },

  // Forms
  { name: 'form',         file: 'Form.tsx',          category: 'forms',      version: '0.1.0', description: 'Form container with validation, Ctrl+S submit, and dirty tracking', deps: [], peers: [] },

  // Utility
  { name: 'panel',        file: 'Panel.tsx',         category: 'utility',    version: '0.1.0', description: 'Titled bordered panel', deps: [], peers: [] },
  { name: 'toggle',       file: 'Toggle.tsx',        category: 'utility',    version: '0.1.0', description: 'Toggle/switch component with on/off labels', deps: [], peers: [] },

  // ── Phase 2 ──────────────────────────────────────────────────────────────

  // Layout
  { name: 'divider',      file: 'Divider.tsx',       category: 'layout',     version: '1.0.0', description: 'Horizontal or vertical divider / rule', deps: [], peers: [] },
  { name: 'spacer',       file: 'Spacer.tsx',        category: 'layout',     version: '1.0.0', description: 'Flexible space between flex children', deps: [], peers: [] },
  { name: 'columns',      file: 'Columns.tsx',       category: 'layout',     version: '1.0.0', description: 'Multi-column layout with configurable widths', deps: [], peers: [] },
  { name: 'center',       file: 'Center.tsx',        category: 'layout',     version: '1.0.0', description: 'Centers children horizontally and vertically', deps: [], peers: [] },
  { name: 'aspect-ratio', file: 'AspectRatio.tsx',   category: 'layout',     version: '1.0.0', description: 'Constrains children to a given aspect ratio', deps: [], peers: [] },

  // Typography
  { name: 'heading',      file: 'Heading.tsx',       category: 'typography', version: '1.0.0', description: 'h1–h4 styled headings with optional figlet ASCII art', deps: [], peers: [] },
  { name: 'code',         file: 'Code.tsx',          category: 'typography', version: '1.0.0', description: 'Syntax-highlighted code block (50+ languages)', deps: [], peers: [] },
  { name: 'link',         file: 'Link.tsx',          category: 'typography', version: '1.0.0', description: 'OSC 8 clickable hyperlink', deps: [], peers: [] },
  { name: 'tag',          file: 'Tag.tsx',           category: 'typography', version: '1.0.0', description: 'Removable chip/tag', deps: [], peers: [] },
  { name: 'markdown',     file: 'Markdown.tsx',      category: 'typography', version: '1.0.0', description: 'Full markdown renderer for terminal', deps: ['marked'], peers: [] },
  { name: 'gradient',     file: 'Gradient.tsx',      category: 'typography', version: '1.0.0', description: 'Color gradient text', deps: [], peers: [] },
  { name: 'big-text',     file: 'BigText.tsx',       category: 'typography', version: '1.0.0', description: 'Figlet-style large ASCII art text', deps: [], peers: [] },
  { name: 'digits',       file: 'Digits.tsx',        category: 'typography', version: '1.0.0', description: 'Box-drawing character numerals', deps: [], peers: [] },

  // Input
  { name: 'text-area',       file: 'TextArea.tsx',      category: 'input', version: '1.0.0', description: 'Multi-line text editor with word wrap', deps: [], peers: [] },
  { name: 'password-input',  file: 'PasswordInput.tsx', category: 'input', version: '1.0.0', description: 'Password input with masked characters and reveal toggle', deps: [], peers: [] },
  { name: 'number-input',    file: 'NumberInput.tsx',   category: 'input', version: '1.0.0', description: 'Numeric input with increment/decrement and bounds', deps: [], peers: [] },
  { name: 'search-input',    file: 'SearchInput.tsx',   category: 'input', version: '1.0.0', description: 'Fuzzy search input with autocomplete', deps: ['mnemonist'], peers: [] },
  { name: 'masked-input',    file: 'MaskedInput.tsx',   category: 'input', version: '1.0.0', description: 'Masked input for phone, date, credit card formats', deps: [], peers: [] },
  { name: 'email-input',     file: 'EmailInput.tsx',    category: 'input', version: '1.0.0', description: 'Email input with validation and domain suggestions', deps: [], peers: [] },
  { name: 'path-input',      file: 'PathInput.tsx',     category: 'input', version: '1.0.0', description: 'Filesystem path input with tab autocomplete', deps: ['glob'], peers: [] },

  // Selection
  { name: 'multi-select',    file: 'MultiSelect.tsx',   category: 'selection', version: '1.0.0', description: 'Multi-select list with checkboxes and select-all', deps: [], peers: [] },
  { name: 'radio-group',     file: 'RadioGroup.tsx',    category: 'selection', version: '1.0.0', description: 'Mutually exclusive radio button group', deps: [], peers: [] },
  { name: 'checkbox-group',  file: 'CheckboxGroup.tsx', category: 'selection', version: '1.0.0', description: 'Checkbox group with min/max selection', deps: [], peers: ['checkbox'] },
  { name: 'tree-select',     file: 'TreeSelect.tsx',    category: 'selection', version: '1.0.0', description: 'Hierarchical tree selection', deps: [], peers: [] },
  { name: 'tag-input',       file: 'TagInput.tsx',      category: 'selection', version: '1.0.0', description: 'Add and remove tags inline', deps: [], peers: [] },
  { name: 'color-picker',    file: 'ColorPicker.tsx',   category: 'selection', version: '1.0.0', description: 'Color picker with palette, hex, and RGB input', deps: [], peers: [] },

  // Data
  { name: 'json',            file: 'JSONView.tsx',      category: 'data', version: '1.0.0', description: 'Pretty-printed JSON with collapsible nodes', deps: [], peers: [] },
  { name: 'virtual-list',    file: 'VirtualList.tsx',   category: 'data', version: '1.0.0', description: 'Virtualized list for 10k+ items', deps: ['mnemonist'], peers: [] },
  { name: 'tree',            file: 'Tree.tsx',          category: 'data', version: '1.0.0', description: 'Expandable/collapsible tree view', deps: [], peers: [] },
  { name: 'directory-tree',  file: 'DirectoryTree.tsx', category: 'data', version: '1.0.0', description: 'Filesystem browser with expand/collapse', deps: ['glob'], peers: [] },
  { name: 'key-value',       file: 'KeyValue.tsx',      category: 'data', version: '1.0.0', description: 'Aligned key–value pairs', deps: [], peers: [] },
  { name: 'definition',      file: 'Definition.tsx',    category: 'data', version: '1.0.0', description: 'Term–description definition list', deps: [], peers: [] },
  { name: 'card',            file: 'Card.tsx',          category: 'data', version: '1.0.0', description: 'Card with header, body, and footer slots', deps: [], peers: [] },
  { name: 'git-status',      file: 'GitStatus.tsx',     category: 'data', version: '1.0.0', description: 'Git status display (branch, staged, modified, ahead/behind)', deps: [], peers: [] },

  // Feedback
  { name: 'progress-circle', file: 'ProgressCircle.tsx', category: 'feedback', version: '1.0.0', description: 'Circular progress indicator using Unicode braille', deps: [], peers: [] },
  { name: 'status-message',  file: 'StatusMessage.tsx',  category: 'feedback', version: '1.0.0', description: 'Inline status message with icon and color', deps: [], peers: [] },
  { name: 'toast',           file: 'Toast.tsx',          category: 'feedback', version: '1.0.0', description: 'Auto-dismissing toast notification', deps: [], peers: [] },
  { name: 'banner',          file: 'Banner.tsx',         category: 'feedback', version: '1.0.0', description: 'Full-width announcement banner', deps: [], peers: [] },
  { name: 'skeleton',        file: 'Skeleton.tsx',       category: 'feedback', version: '1.0.0', description: 'Shimmer loading placeholder', deps: [], peers: [] },

  // Navigation
  { name: 'tabbed-content',  file: 'TabbedContent.tsx',  category: 'navigation', version: '1.0.0', description: 'Tab bar wired to content panels', deps: [], peers: ['tabs'] },
  { name: 'breadcrumb',      file: 'Breadcrumb.tsx',     category: 'navigation', version: '1.0.0', description: 'Breadcrumb navigation trail', deps: [], peers: [] },
  { name: 'pagination',      file: 'Pagination.tsx',     category: 'navigation', version: '1.0.0', description: 'Page navigation with prev/next and jump', deps: [], peers: [] },
  { name: 'command-palette', file: 'CommandPalette.tsx', category: 'navigation', version: '1.0.0', description: 'VS Code–style command palette with fuzzy search', deps: ['mnemonist'], peers: [] },
  { name: 'menu',            file: 'Menu.tsx',           category: 'navigation', version: '1.0.0', description: 'Dropdown menu with nested submenus', deps: [], peers: [] },
  { name: 'sidebar',         file: 'Sidebar.tsx',        category: 'navigation', version: '1.0.0', description: 'Collapsible navigation sidebar panel', deps: [], peers: [] },

  // Overlays
  { name: 'dialog',          file: 'Dialog.tsx',         category: 'overlays',   version: '1.0.0', description: 'Confirmation dialog with OK/Cancel actions', deps: [], peers: [] },
  { name: 'drawer',          file: 'Drawer.tsx',         category: 'overlays',   version: '1.0.0', description: 'Slide-in panel from any edge', deps: [], peers: [] },
  { name: 'tooltip',         file: 'Tooltip.tsx',        category: 'overlays',   version: '1.0.0', description: 'Contextual tooltip on focus or hover', deps: [], peers: [] },
  { name: 'popover',         file: 'Popover.tsx',        category: 'overlays',   version: '1.0.0', description: 'Positioned popover with arbitrary content', deps: [], peers: [] },

  // Forms
  { name: 'form-field',      file: 'FormField.tsx',      category: 'forms', version: '1.0.0', description: 'Form field wrapper with label, hint, and error', deps: [], peers: ['form'] },
  { name: 'wizard',          file: 'Wizard.tsx',         category: 'forms', version: '1.0.0', description: 'Multi-step wizard with per-step validation', deps: [], peers: [] },
  { name: 'confirm',         file: 'Confirm.tsx',        category: 'forms', version: '1.0.0', description: 'Yes/No confirmation prompt', deps: [], peers: [] },
  { name: 'date-picker',     file: 'DatePicker.tsx',     category: 'forms', version: '1.0.0', description: 'Calendar date picker with keyboard navigation', deps: [], peers: [] },
  { name: 'time-picker',     file: 'TimePicker.tsx',     category: 'forms', version: '1.0.0', description: 'Time picker with hour/minute/second spinners', deps: [], peers: [] },
  { name: 'file-picker',     file: 'FilePicker.tsx',     category: 'forms', version: '1.0.0', description: 'Interactive file browser and picker', deps: ['glob'], peers: [] },

  // Utility
  { name: 'embedded-terminal', file: 'EmbeddedTerminal.tsx', category: 'utility', version: '1.0.0', description: 'Embedded PTY terminal panel (requires node-pty peer)', deps: [], peers: [] },
];

// ---------------------------------------------------------------------------
// Source directory mapping (category → src subfolder)
// ---------------------------------------------------------------------------

const SRC_DIR = {
  layout:     'layout',
  typography: 'typography',
  input:      'input',
  selection:  'selection',
  data:       'data',
  feedback:   'feedback',
  navigation: 'navigation',
  overlays:   'overlays',
  forms:      'forms',
  utility:    'utility',
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const COMPONENTS_SRC = join(ROOT, 'packages/components/src');
const REGISTRY_DIR   = join(ROOT, 'registry/components');
const SCHEMA_PATH    = join(ROOT, 'registry/schema.json');
const CLIENT_PATH    = join(ROOT, 'packages/cli/src/registry/client.ts');

let copied = 0;
let skipped = 0;
let missing = 0;

console.log('Publishing registry...\n');

for (const comp of COMPONENTS) {
  const srcSubdir = SRC_DIR[comp.category] ?? comp.category;
  const srcFile   = join(COMPONENTS_SRC, srcSubdir, comp.file);
  const destDir   = join(REGISTRY_DIR, comp.name);
  const destFile  = join(destDir, comp.file);
  const metaFile  = join(destDir, 'meta.json');

  // Create registry/<name>/ directory
  mkdirSync(destDir, { recursive: true });

  // Copy source file
  if (existsSync(srcFile)) {
    copyFileSync(srcFile, destFile);
    copied++;
    console.log(`  ✓  ${comp.name}/${comp.file}`);
  } else {
    missing++;
    console.warn(`  ✗  ${comp.name}/${comp.file} — source not found at ${srcFile}`);
  }

  // Write meta.json
  const meta = {
    name:           comp.name,
    description:    comp.description,
    version:        comp.version,
    category:       comp.category,
    files:          [comp.file],
    deps:           comp.deps,
    peerComponents: comp.peers,
  };
  writeFileSync(metaFile, JSON.stringify(meta, null, 2) + '\n');
}

console.log(`\nCopied ${copied} files, ${missing} missing, ${skipped} skipped.\n`);

// ---------------------------------------------------------------------------
// Regenerate registry/schema.json
// ---------------------------------------------------------------------------

const schemaComponents = {};
for (const comp of COMPONENTS) {
  schemaComponents[comp.name] = {
    name:           comp.name,
    description:    comp.description,
    version:        comp.version,
    category:       comp.category,
    files:          [comp.file],
    deps:           comp.deps,
    peerComponents: comp.peers,
  };
}

const schema = {
  $schema:    'https://arindam200.github.io/termui/schema-meta.json',
  version:    '1.0.0',
  updatedAt:  new Date().toISOString().slice(0, 10),
  components: schemaComponents,
};

writeFileSync(SCHEMA_PATH, JSON.stringify(schema, null, 2) + '\n');
console.log(`Updated registry/schema.json (${COMPONENTS.length} components)`);

// ---------------------------------------------------------------------------
// Regenerate getLocalRegistry() in client.ts
// ---------------------------------------------------------------------------

const clientSrc = readFileSync(CLIENT_PATH, 'utf-8');

// Build the components object literal
const lines = [];
for (const comp of COMPONENTS) {
  const key = JSON.stringify(comp.name);
  lines.push(`      ${key}: {`);
  lines.push(`        name: ${JSON.stringify(comp.name)},`);
  lines.push(`        description: ${JSON.stringify(comp.description)},`);
  lines.push(`        version: ${JSON.stringify(comp.version)},`);
  lines.push(`        category: ${JSON.stringify(comp.category)},`);
  lines.push(`        files: [${JSON.stringify(comp.file)}],`);
  if (comp.deps.length > 0) {
    lines.push(`        deps: [${comp.deps.map(d => JSON.stringify(d)).join(', ')}],`);
  }
  if (comp.peers.length > 0) {
    lines.push(`        peerComponents: [${comp.peers.map(p => JSON.stringify(p)).join(', ')}],`);
  }
  lines.push(`      },`);
}

const newBody = lines.join('\n');

// Replace the components block inside getLocalRegistry()
const updated = clientSrc.replace(
  /(export function getLocalRegistry\(\)[^{]*\{[\s\S]*?return \{\s*version:[^,]+,\s*components: \{)([\s\S]*?)(\},?\s*\};\s*\})/,
  (_match, open, _old, close) => `${open}\n${newBody}\n    ${close}`
);

if (updated === clientSrc) {
  console.warn('Warning: could not patch getLocalRegistry() — check the regex. Edit client.ts manually.');
} else {
  writeFileSync(CLIENT_PATH, updated);
  console.log(`Updated packages/cli/src/registry/client.ts (getLocalRegistry)`);
}

// ---------------------------------------------------------------------------
// Generate registry/index.html (required by GitHub Pages)
// ---------------------------------------------------------------------------

const byCategory = {};
for (const comp of COMPONENTS) {
  if (!byCategory[comp.category]) byCategory[comp.category] = [];
  byCategory[comp.category].push(comp);
}

const rows = Object.entries(byCategory).map(([cat, comps]) =>
  `<tr><td class="cat">${cat}</td><td>${comps.map(c =>
    `<a href="components/${c.name}/meta.json"><code>${c.name}</code></a>`
  ).join(' ')}</td></tr>`
).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TermUI Registry</title>
  <style>
    body { font-family: monospace; max-width: 860px; margin: 40px auto; padding: 0 20px; background: #0d0d0d; color: #cdd6f4; }
    h1 { color: #cba6f7; } h2 { color: #89b4fa; border-bottom: 1px solid #313244; padding-bottom: 6px; }
    a { color: #89dceb; text-decoration: none; } a:hover { text-decoration: underline; }
    code { background: #181825; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    td { padding: 6px 10px; vertical-align: top; border-bottom: 1px solid #1e1e2e; }
    .cat { color: #a6e3a1; white-space: nowrap; width: 120px; }
    .meta { color: #6c7086; font-size: 0.85em; margin-top: 8px; }
    pre { background: #181825; padding: 12px 16px; border-radius: 6px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>TermUI Registry</h1>
  <p class="meta">${COMPONENTS.length} components &nbsp;·&nbsp; v1.0.0 &nbsp;·&nbsp; Updated ${new Date().toISOString().slice(0,10)}</p>

  <h2>Install a component</h2>
  <pre>npx termui add spinner</pre>

  <h2>API endpoints</h2>
  <ul>
    <li><a href="schema.json">schema.json</a> — full component manifest</li>
    <li><code>components/&lt;name&gt;/meta.json</code> — component metadata</li>
    <li><code>components/&lt;name&gt;/&lt;Name&gt;.tsx</code> — component source</li>
  </ul>

  <h2>Components (${COMPONENTS.length})</h2>
  <table>${rows}</table>

  <p class="meta">
    <a href="https://github.com/arindam200/termui">GitHub</a>
  </p>
</body>
</html>
`;

writeFileSync(join(ROOT, 'registry/index.html'), html);
console.log('Generated registry/index.html');

console.log('\nDone.');

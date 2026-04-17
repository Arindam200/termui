/**
 * termui mcp — Start the TermUI MCP server (stdio transport).
 *
 * Exposes 5 tools to AI assistants (Claude Code, Cursor, Copilot):
 *   list_components    — browse all components grouped by category
 *   add_component      — install component(s) into the current project
 *   get_component_docs — full props + usage for a specific component
 *   search_components  — keyword search over the registry
 *   get_theme_tokens   — list available themes and their token structure
 *
 * Start with: npx termui mcp
 * Install config: npx termui add mcp
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { homedir, platform } from 'os';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getLocalRegistry, fetchManifest } from '../registry/client.js';
import { add } from './add.js';
import { intro, step, done, outro, hi, dim, select } from '../utils/ui.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const THEMES = [
  'default',
  'dracula',
  'nord',
  'catppuccin',
  'monokai',
  'tokyo-night',
  'one-dark',
  'solarized',
  'high-contrast',
  'high-contrast-light',
];

const THEME_TOKEN_DESCRIPTION = `
TermUI themes provide these design token categories:
- colors.primary, colors.secondary, colors.accent
- colors.background, colors.surface, colors.border
- colors.text, colors.textMuted, colors.textInverse
- colors.success, colors.warning, colors.error, colors.info
- spacing.xs, spacing.sm, spacing.md, spacing.lg, spacing.xl
- radius.sm, radius.md, radius.lg
`.trim();

const MCP_ENTRY = {
  command: 'npx',
  args: ['termui', 'mcp'],
};

// ─── Platform config paths ────────────────────────────────────────────────────

function getGlobalConfigPath(): string {
  const home = homedir();
  switch (platform()) {
    case 'win32':
      return resolve(
        process.env['APPDATA'] ?? resolve(home, 'AppData', 'Roaming'),
        'Claude',
        'claude_desktop_config.json'
      );
    case 'darwin':
      return resolve(
        home,
        'Library',
        'Application Support',
        'Claude',
        'claude_desktop_config.json'
      );
    default:
      return resolve(home, '.config', 'Claude', 'claude_desktop_config.json');
  }
}

function getClaudeCodeGlobalPath(): string {
  return resolve(homedir(), '.claude', 'settings.json');
}

// ─── Write MCP entry into a JSON config file ──────────────────────────────────

function writeMcpConfig(configPath: string): void {
  let existing: Record<string, unknown> = {};
  if (existsSync(configPath)) {
    try {
      existing = JSON.parse(readFileSync(configPath, 'utf-8')) as Record<string, unknown>;
    } catch {
      // Start fresh if the file is malformed
    }
  }

  const mcpServers = (existing['mcpServers'] as Record<string, unknown> | undefined) ?? {};
  mcpServers['termui'] = MCP_ENTRY;
  existing['mcpServers'] = mcpServers;

  const dir = dirname(configPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(configPath, JSON.stringify(existing, null, 2) + '\n', 'utf-8');
}

// ─── Install flow (termui add mcp) ────────────────────────────────────────────

export async function installMcp(): Promise<void> {
  intro('termui');

  const localPath = resolve(process.cwd(), '.mcp.json');
  const claudeCodeGlobal = getClaudeCodeGlobalPath();
  const claudeDesktop = getGlobalConfigPath();

  const scope = await select<'local' | 'claude-code' | 'claude-desktop'>(
    'Where do you want to install the TermUI MCP server?',
    [
      {
        value: 'local',
        label: 'Local project',
        hint: '.mcp.json in current directory (Claude Code project scope)',
      },
      {
        value: 'claude-code',
        label: 'Global — Claude Code',
        hint: `~/.claude/settings.json`,
      },
      {
        value: 'claude-desktop',
        label: 'Global — Claude Desktop',
        hint: claudeDesktop.replace(homedir(), '~'),
      },
    ]
  );

  let configPath: string;
  if (scope === 'local') {
    configPath = localPath;
  } else if (scope === 'claude-code') {
    configPath = claudeCodeGlobal;
  } else {
    configPath = claudeDesktop;
  }

  writeMcpConfig(configPath);

  const displayPath = configPath.replace(homedir(), '~');
  step(`Written to ${hi(displayPath)}`);

  done('TermUI MCP server installed');

  if (scope === 'local') {
    outro(
      `Start the server with ${hi('npx termui mcp')}  ·  ` +
        `Claude Code will auto-detect ${hi('.mcp.json')}`
    );
  } else if (scope === 'claude-code') {
    outro(
      `Restart Claude Code to pick up the new server  ·  ` +
        `Then ask Claude to ${hi('"add a Spinner to my project"')}`
    );
  } else {
    outro(
      `Restart Claude Desktop to pick up the new server  ·  ` + `Config saved to ${hi(displayPath)}`
    );
  }
}

// ─── MCP Server ───────────────────────────────────────────────────────────────

export async function mcp(_args: string[]): Promise<void> {
  // Fetch registry (with embedded fallback so the server always starts)
  const registryUrl = 'https://arindam200.github.io/termui';
  let registry = getLocalRegistry();
  try {
    registry = await fetchManifest(registryUrl);
  } catch {
    // Use embedded local registry
  }

  const server = new Server({ name: 'termui', version: '1.4.2' }, { capabilities: { tools: {} } });

  // ── Tool definitions ────────────────────────────────────────────────────────
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'list_components',
        description:
          'List all available TermUI components grouped by category. ' +
          'Pass an optional category to filter results.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description:
                'Filter by category. Valid values: layout, typography, input, selection, ' +
                'data, feedback, navigation, overlays, forms, charts, utility, templates, ai',
            },
          },
        },
      },
      {
        name: 'add_component',
        description:
          'Install one or more TermUI components into the current project. ' +
          'Copies source files into ./components/ui/<category>/. ' +
          'Automatically installs peer components.',
        inputSchema: {
          type: 'object',
          properties: {
            components: {
              type: 'array',
              items: { type: 'string' },
              description: 'Component names to install (e.g. ["spinner", "progress-bar", "toast"])',
            },
          },
          required: ['components'],
        },
      },
      {
        name: 'get_component_docs',
        description:
          'Get full documentation for a specific TermUI component: ' +
          'description, installation, import path, peer components, and npm dependencies.',
        inputSchema: {
          type: 'object',
          properties: {
            component: {
              type: 'string',
              description: 'Exact component name (e.g. "select", "data-grid", "chat-thread")',
            },
          },
          required: ['component'],
        },
      },
      {
        name: 'search_components',
        description:
          'Search TermUI components by keyword or use-case description. ' +
          'Returns the top matching components with install commands.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description:
                'Search query (e.g. "loading indicator", "date picker", "bar chart", "chat")',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_theme_tokens',
        description:
          'List all available TermUI themes and their design token structure. ' +
          'Use this to suggest correct theme names or token paths.',
        inputSchema: { type: 'object', properties: {} },
      },
    ],
  }));

  // ── Tool call dispatch ──────────────────────────────────────────────────────
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // ── list_components ───────────────────────────────────────────────────────
    if (name === 'list_components') {
      const filterCategory = (args as { category?: string }).category?.toLowerCase();
      const components = Object.values(registry.components);
      const filtered = filterCategory
        ? components.filter((c) => c.category === filterCategory)
        : components;

      const byCategory: Record<string, typeof filtered> = {};
      for (const comp of filtered) {
        if (!byCategory[comp.category]) byCategory[comp.category] = [];
        byCategory[comp.category]!.push(comp);
      }

      const lines: string[] = [
        `TermUI has ${filtered.length} component${filtered.length !== 1 ? 's' : ''}` +
          (filterCategory ? ` in category "${filterCategory}"` : '') +
          ':\n',
      ];
      for (const [cat, comps] of Object.entries(byCategory).sort(([a], [b]) =>
        a.localeCompare(b)
      )) {
        lines.push(`## ${cat} (${comps.length})`);
        for (const comp of comps) {
          lines.push(`  - **${comp.name}** — ${comp.description}`);
        }
        lines.push('');
      }

      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }

    // ── add_component ─────────────────────────────────────────────────────────
    if (name === 'add_component') {
      const { components } = args as { components: string[] };

      if (!components || components.length === 0) {
        return {
          content: [{ type: 'text', text: 'Error: No component names provided.' }],
          isError: true,
        };
      }

      const unknown = components.filter((c) => !registry.components[c]);
      if (unknown.length > 0) {
        const all = Object.keys(registry.components).sort();
        return {
          content: [
            {
              type: 'text',
              text:
                `Unknown component(s): ${unknown.join(', ')}\n\n` +
                `Run list_components or search_components to find the correct name.\n` +
                `All available: ${all.join(', ')}`,
            },
          ],
          isError: true,
        };
      }

      // Suppress console output — MCP communicates over stdout so logs would corrupt the stream
      const captured: string[] = [];
      const origLog = console.log;
      const origError = console.error;
      console.log = (...a: unknown[]) => captured.push(a.map(String).join(' '));
      console.error = (...a: unknown[]) => captured.push(a.map(String).join(' '));

      try {
        await add(components, { isNested: true });
      } catch (err) {
        console.log = origLog;
        console.error = origError;
        return {
          content: [
            {
              type: 'text',
              text: `Failed to install ${components.join(', ')}: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      } finally {
        console.log = origLog;
        console.error = origError;
      }

      const lines = [
        `Successfully installed: ${components.join(', ')}`,
        ``,
        `Import example:`,
        `\`\`\`tsx`,
        `import { ${components
          .map((c) =>
            c
              .replace(/-([a-z])/g, (_: string, l: string) => l.toUpperCase())
              .replace(/^[a-z]/, (l: string) => l.toUpperCase())
          )
          .join(', ')} } from './components/ui';`,
        `\`\`\``,
      ];

      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }

    // ── get_component_docs ────────────────────────────────────────────────────
    if (name === 'get_component_docs') {
      const { component } = args as { component: string };
      const meta = registry.components[component];

      if (!meta) {
        const all = Object.keys(registry.components);
        const suggestions = all
          .filter((n) => n.includes(component) || component.includes(n.slice(0, 4)))
          .slice(0, 5);

        return {
          content: [
            {
              type: 'text',
              text:
                `No component named "${component}" found.\n\n` +
                (suggestions.length > 0
                  ? `Did you mean: ${suggestions.join(', ')}?`
                  : `Use list_components to see all available components.`),
            },
          ],
          isError: true,
        };
      }

      const pascalName = meta.name
        .replace(/-([a-z])/g, (_: string, l: string) => l.toUpperCase())
        .replace(/^[a-z]/, (l: string) => l.toUpperCase());

      const lines = [
        `# ${meta.name}`,
        ``,
        `**Category:** ${meta.category}`,
        `**Version:** ${meta.version}`,
        `**Description:** ${meta.description}`,
        ``,
        `## Installation`,
        `\`\`\`bash`,
        `npx termui add ${meta.name}`,
        `\`\`\``,
        ``,
        `## Import`,
        `\`\`\`tsx`,
        `import { ${pascalName} } from './components/ui';`,
        `\`\`\``,
        ``,
      ];

      if (meta.peerComponents && meta.peerComponents.length > 0) {
        lines.push(`## Peer Components (auto-installed)`);
        for (const peer of meta.peerComponents) {
          lines.push(`  - ${peer}`);
        }
        lines.push('');
      }

      if (meta.deps && meta.deps.length > 0) {
        lines.push(`## npm Dependencies`);
        lines.push(`\`\`\`bash`);
        lines.push(`npm install ${meta.deps.join(' ')}`);
        lines.push(`\`\`\``);
        lines.push('');
      }

      lines.push(`## Source Files`);
      for (const file of meta.files) {
        lines.push(`  - \`${file}\``);
      }

      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }

    // ── search_components ─────────────────────────────────────────────────────
    if (name === 'search_components') {
      const { query } = args as { query: string };
      const q = query.toLowerCase();
      const words = q.split(/\s+/).filter((w) => w.length >= 3);
      const components = Object.values(registry.components);

      const scored = components
        .map((comp) => {
          let score = 0;
          const nameLower = comp.name.toLowerCase();
          const descLower = comp.description.toLowerCase();
          const catLower = comp.category.toLowerCase();

          if (nameLower === q) score += 20;
          else if (nameLower.includes(q)) score += 10;
          if (descLower.includes(q)) score += 5;
          if (catLower.includes(q)) score += 3;

          for (const word of words) {
            if (nameLower.includes(word)) score += 4;
            if (descLower.includes(word)) score += 2;
            if (catLower === word) score += 3;
          }

          return { comp, score };
        })
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      if (scored.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text:
                `No components matched "${query}".\n\n` +
                `Try list_components to browse everything available, or use a broader query.`,
            },
          ],
        };
      }

      const lines = [
        `Search results for "${query}" (${scored.length} match${scored.length !== 1 ? 'es' : ''}):\n`,
      ];
      for (const { comp } of scored) {
        lines.push(`**${comp.name}** _(${comp.category})_ — ${comp.description}`);
        lines.push(`  \`npx termui add ${comp.name}\``);
        lines.push('');
      }

      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }

    // ── get_theme_tokens ──────────────────────────────────────────────────────
    if (name === 'get_theme_tokens') {
      const lines = [
        `# TermUI Themes`,
        ``,
        `**Available themes (${THEMES.length}):** ${THEMES.join(', ')}`,
        ``,
        `## Apply a theme`,
        `\`\`\`tsx`,
        `import { ThemeProvider } from './components/ui';`,
        ``,
        `<ThemeProvider theme="dracula">`,
        `  <App />`,
        `</ThemeProvider>`,
        `\`\`\``,
        ``,
        `## Or via CLI`,
        `\`\`\`bash`,
        `npx termui theme dracula`,
        `\`\`\``,
        ``,
        `## Design Token Structure`,
        THEME_TOKEN_DESCRIPTION,
        ``,
        `## Override tokens`,
        `\`\`\`tsx`,
        `import { createTheme } from './components/ui';`,
        ``,
        `const myTheme = createTheme('dracula', {`,
        `  colors: { primary: '#ff6e96' },`,
        `});`,
        ``,
        `<ThemeProvider theme={myTheme}>...`,
        `\`\`\``,
      ];

      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }

    return {
      content: [{ type: 'text', text: `Unknown tool: "${name}"` }],
      isError: true,
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// ─── Help text (termui mcp --help) ────────────────────────────────────────────

export function mcpHelp(): void {
  console.log(`
  ${dim('termui mcp')} — Start the TermUI MCP server

  ${dim('Usage')}
    npx termui mcp            Start server (stdio transport)
    npx termui add mcp        Install server config (prompts local/global)

  ${dim('Tools exposed to AI assistants')}
    list_components           Browse all components by category
    add_component             Install component(s) into current project
    get_component_docs        Full docs for a specific component
    search_components         Search by keyword or use-case
    get_theme_tokens          Available themes and token structure

  ${dim('Examples')}
    # Add to Claude Code project scope
    npx termui add mcp        → writes .mcp.json

    # Add globally for Claude Desktop
    npx termui add mcp        → writes to ~/Library/Application Support/Claude/...
`);
}

import { existsSync } from 'fs';
import { join } from 'path';
import { getLocalRegistry } from '../registry/client.js';
import { printLogo, intro, step, outro, hi, dim, c } from '../utils/ui.js';
import { getConfig } from '../utils/config.js';

const CATEGORY_ICONS: Record<string, string> = {
  layout: '📐',
  typography: '🔤',
  input: '⌨️',
  selection: '☑️',
  data: '📊',
  feedback: '💬',
  navigation: '🧭',
  overlays: '🪟',
  forms: '📝',
  utility: '🔧',
  charts: '📈',
  templates: '🎨',
};

export async function list(_args: string[], opts?: { isNested?: boolean }): Promise<void> {
  const args = _args;

  // Parse flags
  const categoryIdx = args.indexOf('--category');
  const categoryFilter = categoryIdx !== -1 ? args[categoryIdx + 1] : undefined;

  const searchIdx = args.indexOf('--search');
  const searchQuery = searchIdx !== -1 ? args[searchIdx + 1] : undefined;

  const jsonMode = args.includes('--json');
  const installedOnly = args.includes('--installed');

  const registry = getLocalRegistry();
  let components = Object.values(registry.components);

  // Apply --category filter
  if (categoryFilter) {
    components = components.filter(
      (comp) => comp.category.toLowerCase() === categoryFilter.toLowerCase()
    );
  }

  // Apply --search filter (substring match on name or description)
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    components = components.filter(
      (comp) =>
        comp.name.toLowerCase().includes(query) || comp.description.toLowerCase().includes(query)
    );
  }

  // Apply --installed filter
  if (installedOnly) {
    const cwd = process.cwd();
    const config = getConfig(cwd);
    components = components.filter((comp) => {
      if (!comp.files || comp.files.length === 0) return false;
      return existsSync(join(cwd, config.componentsDir, comp.category, comp.files[0]!));
    });
  }

  // --json mode: output JSON and return immediately
  if (jsonMode) {
    const output = {
      components: components.map((comp) => ({
        name: comp.name,
        category: comp.category,
        description: comp.description,
        files: comp.files,
      })),
      total: components.length,
    };
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  // Group by category
  const byCategory: Record<string, typeof components> = {};
  for (const comp of components) {
    if (!byCategory[comp.category]) byCategory[comp.category] = [];
    byCategory[comp.category]!.push(comp);
  }

  if (!opts?.isNested) {
    printLogo();
    intro('termui');
  }

  for (const [category, comps] of Object.entries(byCategory)) {
    const icon = CATEGORY_ICONS[category] ?? '•';
    step(`${c.bold}${icon}  ${capitalize(category)}${c.reset}  ${dim(`(${comps.length})`)}`);
    for (const comp of comps) {
      const name = comp.name.padEnd(22);
      console.log(`${c.gray}│${c.reset}     ${hi(name)}  ${dim(comp.description)}`);
    }
  }

  outro(
    `${hi(String(components.length))} components total  ·  ${hi('npx termui add <name>')} to install`
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

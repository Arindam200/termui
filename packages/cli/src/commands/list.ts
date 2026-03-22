import { getConfig } from '../utils/config.js';
import { getLocalRegistry } from '../registry/client.js';

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

export async function list(_args: string[]): Promise<void> {
  const registry = getLocalRegistry();
  const components = Object.values(registry.components);

  // Group by category
  const byCategory: Record<string, typeof components> = {};
  for (const comp of components) {
    if (!byCategory[comp.category]) byCategory[comp.category] = [];
    byCategory[comp.category]!.push(comp);
  }

  console.log('\n\x1b[1m\x1b[35m◆ TermUI Components\x1b[0m\n');

  for (const [category, comps] of Object.entries(byCategory)) {
    const icon = CATEGORY_ICONS[category] ?? '•';
    console.log(`\x1b[1m${icon}  ${capitalize(category)}\x1b[0m`);
    for (const comp of comps) {
      const name = comp.name.padEnd(20);
      console.log(`  \x1b[36m${name}\x1b[0m  \x1b[2m${comp.description}\x1b[0m`);
    }
    console.log();
  }

  console.log(`\x1b[2mTotal: ${components.length} components\x1b[0m`);
  console.log(`\x1b[2mInstall: npx termui add <name>\x1b[0m\n`);
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

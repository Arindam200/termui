import { getLocalRegistry } from '../registry/client.js';
import { printLogo, intro, step, outro, hi, dim, c } from '../utils/ui.js';

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

export async function list(_args: string[], opts?: { skipHeader?: boolean }): Promise<void> {
  const registry = getLocalRegistry();
  const components = Object.values(registry.components);

  // Group by category
  const byCategory: Record<string, typeof components> = {};
  for (const comp of components) {
    if (!byCategory[comp.category]) byCategory[comp.category] = [];
    byCategory[comp.category]!.push(comp);
  }

  if (!opts?.skipHeader) {
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

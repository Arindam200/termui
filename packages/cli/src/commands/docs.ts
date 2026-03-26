import { getConfig } from '../utils/config.js';
import { fetchComponentFile, fetchManifest } from '../registry/client.js';
import { printLogo, intro, active, fail, hi, dim, bold, c } from '../utils/ui.js';

export async function docs(args: string[]): Promise<void> {
  const componentName = args[0];
  if (!componentName) {
    console.error(`${c.yellow}Usage:${c.reset} npx termui docs <component>`);
    console.error(`  Example: ${hi('npx termui docs spinner')}\n`);
    process.exit(1);
  }

  const cwd = process.cwd();
  const config = getConfig(cwd);
  const registryUrl = config.registry ?? 'https://arindam200.github.io/termui';

  printLogo();
  intro('termui docs');

  active(`Looking up ${bold(componentName)}…`);
  let registry: Awaited<ReturnType<typeof fetchManifest>>;
  try {
    registry = await fetchManifest(registryUrl);
  } catch {
    fail(`Failed to connect to registry at ${bold(registryUrl)}`);
    process.exit(2);
  }

  const meta = registry.components[componentName];
  if (!meta) {
    fail(`No component ${bold(`'${componentName}'`)} found in registry.`);
    process.exit(1);
  }

  // Try to fetch docs.md from registry
  let docsContent: string | null = null;
  try {
    docsContent = await fetchComponentFile(registryUrl, componentName, 'docs.md');
  } catch {
    // docs.md not in registry — generate inline from meta
  }

  if (docsContent) {
    // Render markdown docs inline
    console.log('\n' + docsContent);
  } else {
    // Auto-generate docs from meta.json
    console.log(`\n${bold(c.cyan + meta.name + c.reset)}  ${dim(meta.description ?? '')}`);
    console.log(`${dim('─'.repeat(50))}`);
    console.log(`  ${bold('Category:')} ${meta.category}`);
    console.log(`  ${bold('Version:')}  ${meta.version}`);
    if (meta.files && meta.files.length > 0) {
      console.log(`  ${bold('Files:')}    ${meta.files.join(', ')}`);
    }
    if (meta.deps && meta.deps.length > 0) {
      console.log(`  ${bold('Deps:')}     ${meta.deps.join(', ')}`);
    }
    if (meta.peerComponents && meta.peerComponents.length > 0) {
      console.log(`  ${bold('Peers:')}    ${meta.peerComponents.join(', ')}`);
    }
    console.log('');
    console.log(`${dim('Install with:')} ${hi(`npx termui add ${componentName}`)}`);
  }

  console.log('');
}

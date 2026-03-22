import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface ComponentMeta {
  name: string;
  description: string;
  version: string;
  category: string;
  deps?: string[];
  peerComponents?: string[];
  files: string[];
}

export interface RegistryManifest {
  version: string;
  components: Record<string, ComponentMeta>;
}

/** Fetch the registry manifest from a URL or use local fallback */
export async function fetchManifest(registryUrl: string): Promise<RegistryManifest> {
  try {
    const url = `${registryUrl}/schema.json`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Registry returned ${response.status}`);
    return (await response.json()) as RegistryManifest;
  } catch {
    // Fallback to embedded local registry
    return getLocalRegistry();
  }
}

/** Fetch a single component's source file */
export async function fetchComponentFile(
  registryUrl: string,
  componentName: string,
  fileName: string
): Promise<string> {
  const url = `${registryUrl}/components/${componentName}/${fileName}`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Failed to fetch ${fileName}: ${response.status}`);
  return response.text();
}

/** Local fallback registry — embedded in CLI for offline/initial use */
export function getLocalRegistry(): RegistryManifest {
  return {
    version: '0.1.0',
    components: {
      box: {
        name: 'box',
        description: 'Enhanced flexbox container with theme-aware borders',
        version: '0.1.0',
        category: 'layout',
        files: ['Box.tsx'],
        peerComponents: [],
      },
      stack: {
        name: 'stack',
        description: 'Vertical/horizontal stack with gap',
        version: '0.1.0',
        category: 'layout',
        files: ['Stack.tsx'],
      },
      grid: {
        name: 'grid',
        description: 'Rows × columns grid layout',
        version: '0.1.0',
        category: 'layout',
        files: ['Grid.tsx'],
      },
      'scroll-view': {
        name: 'scroll-view',
        description: 'Scrollable container with scrollbar',
        version: '0.1.0',
        category: 'layout',
        files: ['ScrollView.tsx'],
      },
      text: {
        name: 'text',
        description: 'Rich inline text with formatting',
        version: '0.1.0',
        category: 'typography',
        files: ['Text.tsx'],
      },
      badge: {
        name: 'badge',
        description: 'Semantic status indicator badge',
        version: '0.1.0',
        category: 'typography',
        files: ['Badge.tsx'],
      },
      'text-input': {
        name: 'text-input',
        description: 'Single-line text input with placeholder, validation, mask',
        version: '0.1.0',
        category: 'input',
        files: ['TextInput.tsx'],
      },
      checkbox: {
        name: 'checkbox',
        description: 'Checkbox with indeterminate state',
        version: '0.1.0',
        category: 'selection',
        files: ['Checkbox.tsx'],
      },
      select: {
        name: 'select',
        description: 'Single-select with arrow key navigation',
        version: '0.1.0',
        category: 'selection',
        files: ['Select.tsx'],
      },
      list: {
        name: 'list',
        description: 'Navigable list with filtering',
        version: '0.1.0',
        category: 'data',
        files: ['List.tsx'],
      },
      table: {
        name: 'table',
        description: 'Sortable, filterable, paginated data table',
        version: '0.1.0',
        category: 'data',
        files: ['Table.tsx'],
      },
      spinner: {
        name: 'spinner',
        description: '12+ animation styles spinner',
        version: '0.1.0',
        category: 'feedback',
        files: ['Spinner.tsx'],
      },
      'progress-bar': {
        name: 'progress-bar',
        description: 'Determinate progress bar with ETA',
        version: '0.1.0',
        category: 'feedback',
        files: ['ProgressBar.tsx'],
      },
      alert: {
        name: 'alert',
        description: 'Success/error/warning/info alert',
        version: '0.1.0',
        category: 'feedback',
        files: ['Alert.tsx'],
      },
      tabs: {
        name: 'tabs',
        description: 'Tab bar with keyboard navigation',
        version: '0.1.0',
        category: 'navigation',
        files: ['Tabs.tsx'],
      },
      modal: {
        name: 'modal',
        description: 'Focus-trapped overlay modal',
        version: '0.1.0',
        category: 'overlays',
        files: ['Modal.tsx'],
      },
      form: {
        name: 'form',
        description: 'Form with validation, submission, dirty tracking',
        version: '0.1.0',
        category: 'forms',
        files: ['Form.tsx'],
      },
      panel: {
        name: 'panel',
        description: 'Titled panel with border',
        version: '0.1.0',
        category: 'utility',
        files: ['Panel.tsx'],
      },
      toggle: {
        name: 'toggle',
        description: 'Toggle/switch component',
        version: '0.1.0',
        category: 'utility',
        files: ['Toggle.tsx'],
      },
    },
  };
}

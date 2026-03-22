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

/** Primary registry (GitHub Pages) */
export const PRIMARY_REGISTRY = 'https://arindam200.github.io/termui';

/**
 * jsDelivr CDN — automatically mirrors the GitHub repo.
 * Used as fallback when GitHub Pages is unreachable.
 * No setup needed; works as long as the repo is public.
 */
export const FALLBACK_REGISTRY = 'https://cdn.jsdelivr.net/gh/arindam200/termui@main/registry';

async function tryFetch(url: string, timeout = 5000): Promise<Response> {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeout) });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response;
}

/** Fetch the registry manifest — tries primary, then jsDelivr, then embedded fallback */
export async function fetchManifest(registryUrl: string): Promise<RegistryManifest> {
  const urls = [`${registryUrl}/schema.json`, `${FALLBACK_REGISTRY}/schema.json`];

  for (const url of urls) {
    try {
      const res = await tryFetch(url);
      return (await res.json()) as RegistryManifest;
    } catch {
      // try next
    }
  }

  // All remote sources failed — use the embedded manifest
  return getLocalRegistry();
}

/** Fetch a component source file — tries primary, then jsDelivr, then throws */
export async function fetchComponentFile(
  registryUrl: string,
  componentName: string,
  fileName: string
): Promise<string> {
  const urls = [
    `${registryUrl}/components/${componentName}/${fileName}`,
    `${FALLBACK_REGISTRY}/components/${componentName}/${fileName}`,
  ];

  for (const url of urls) {
    try {
      const res = await tryFetch(url, 10000);
      return res.text();
    } catch {
      // try next
    }
  }

  throw new Error(`Could not fetch ${fileName} from any registry source.`);
}

/** Local fallback registry — embedded in CLI for offline/initial use */
export function getLocalRegistry(): RegistryManifest {
  return {
    version: '1.0.0',
    components: {
      box: {
        name: 'box',
        description: 'Enhanced flexbox container with theme-aware borders',
        version: '0.1.0',
        category: 'layout',
        files: ['Box.tsx'],
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
        description: 'Rich inline text with bold, italic, color, dim formatting',
        version: '0.1.0',
        category: 'typography',
        files: ['Text.tsx'],
      },
      badge: {
        name: 'badge',
        description: 'Semantic status indicator badge (success/error/warning/info)',
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
        description: 'Single-select dropdown with arrow-key navigation',
        version: '0.1.0',
        category: 'selection',
        files: ['Select.tsx'],
      },
      list: {
        name: 'list',
        description: 'Navigable list with optional filtering',
        version: '0.1.0',
        category: 'data',
        files: ['List.tsx'],
      },
      table: {
        name: 'table',
        description: 'Sortable, selectable, paginated data table',
        version: '0.1.0',
        category: 'data',
        files: ['Table.tsx'],
      },
      spinner: {
        name: 'spinner',
        description: 'Animated spinner with 12+ styles',
        version: '0.1.0',
        category: 'feedback',
        files: ['Spinner.tsx'],
      },
      'progress-bar': {
        name: 'progress-bar',
        description: 'Determinate progress bar with percent and value/total display',
        version: '0.1.0',
        category: 'feedback',
        files: ['ProgressBar.tsx'],
      },
      alert: {
        name: 'alert',
        description: 'Alert box with success/error/warning/info variants',
        version: '0.1.0',
        category: 'feedback',
        files: ['Alert.tsx'],
      },
      tabs: {
        name: 'tabs',
        description: 'Tab bar with left/right arrow and tab-key navigation',
        version: '0.1.0',
        category: 'navigation',
        files: ['Tabs.tsx'],
      },
      modal: {
        name: 'modal',
        description: 'Focus-trapped overlay modal, close with Esc',
        version: '0.1.0',
        category: 'overlays',
        files: ['Modal.tsx'],
      },
      form: {
        name: 'form',
        description: 'Form container with validation, Ctrl+S submit, and dirty tracking',
        version: '0.1.0',
        category: 'forms',
        files: ['Form.tsx'],
      },
      panel: {
        name: 'panel',
        description: 'Titled bordered panel',
        version: '0.1.0',
        category: 'utility',
        files: ['Panel.tsx'],
      },
      toggle: {
        name: 'toggle',
        description: 'Toggle/switch component with on/off labels',
        version: '0.1.0',
        category: 'utility',
        files: ['Toggle.tsx'],
      },
      divider: {
        name: 'divider',
        description: 'Horizontal or vertical divider / rule',
        version: '1.0.0',
        category: 'layout',
        files: ['Divider.tsx'],
      },
      spacer: {
        name: 'spacer',
        description: 'Flexible space between flex children',
        version: '1.0.0',
        category: 'layout',
        files: ['Spacer.tsx'],
      },
      columns: {
        name: 'columns',
        description: 'Multi-column layout with configurable widths',
        version: '1.0.0',
        category: 'layout',
        files: ['Columns.tsx'],
      },
      center: {
        name: 'center',
        description: 'Centers children horizontally and vertically',
        version: '1.0.0',
        category: 'layout',
        files: ['Center.tsx'],
      },
      'aspect-ratio': {
        name: 'aspect-ratio',
        description: 'Constrains children to a given aspect ratio',
        version: '1.0.0',
        category: 'layout',
        files: ['AspectRatio.tsx'],
      },
      heading: {
        name: 'heading',
        description: 'h1–h4 styled headings with optional figlet ASCII art',
        version: '1.0.0',
        category: 'typography',
        files: ['Heading.tsx'],
      },
      code: {
        name: 'code',
        description: 'Syntax-highlighted code block (50+ languages)',
        version: '1.0.0',
        category: 'typography',
        files: ['Code.tsx'],
      },
      link: {
        name: 'link',
        description: 'OSC 8 clickable hyperlink',
        version: '1.0.0',
        category: 'typography',
        files: ['Link.tsx'],
      },
      tag: {
        name: 'tag',
        description: 'Removable chip/tag',
        version: '1.0.0',
        category: 'typography',
        files: ['Tag.tsx'],
      },
      markdown: {
        name: 'markdown',
        description: 'Full markdown renderer for terminal',
        version: '1.0.0',
        category: 'typography',
        files: ['Markdown.tsx'],
        deps: ['marked'],
      },
      gradient: {
        name: 'gradient',
        description: 'Color gradient text',
        version: '1.0.0',
        category: 'typography',
        files: ['Gradient.tsx'],
      },
      'big-text': {
        name: 'big-text',
        description: 'Figlet-style large ASCII art text',
        version: '1.0.0',
        category: 'typography',
        files: ['BigText.tsx'],
      },
      digits: {
        name: 'digits',
        description: 'Box-drawing character numerals',
        version: '1.0.0',
        category: 'typography',
        files: ['Digits.tsx'],
      },
      'text-area': {
        name: 'text-area',
        description: 'Multi-line text editor with word wrap',
        version: '1.0.0',
        category: 'input',
        files: ['TextArea.tsx'],
      },
      'password-input': {
        name: 'password-input',
        description: 'Password input with masked characters and reveal toggle',
        version: '1.0.0',
        category: 'input',
        files: ['PasswordInput.tsx'],
      },
      'number-input': {
        name: 'number-input',
        description: 'Numeric input with increment/decrement and bounds',
        version: '1.0.0',
        category: 'input',
        files: ['NumberInput.tsx'],
      },
      'search-input': {
        name: 'search-input',
        description: 'Fuzzy search input with autocomplete',
        version: '1.0.0',
        category: 'input',
        files: ['SearchInput.tsx'],
        deps: ['mnemonist'],
      },
      'masked-input': {
        name: 'masked-input',
        description: 'Masked input for phone, date, credit card formats',
        version: '1.0.0',
        category: 'input',
        files: ['MaskedInput.tsx'],
      },
      'email-input': {
        name: 'email-input',
        description: 'Email input with validation and domain suggestions',
        version: '1.0.0',
        category: 'input',
        files: ['EmailInput.tsx'],
      },
      'path-input': {
        name: 'path-input',
        description: 'Filesystem path input with tab autocomplete',
        version: '1.0.0',
        category: 'input',
        files: ['PathInput.tsx'],
        deps: ['glob'],
      },
      'multi-select': {
        name: 'multi-select',
        description: 'Multi-select list with checkboxes and select-all',
        version: '1.0.0',
        category: 'selection',
        files: ['MultiSelect.tsx'],
      },
      'radio-group': {
        name: 'radio-group',
        description: 'Mutually exclusive radio button group',
        version: '1.0.0',
        category: 'selection',
        files: ['RadioGroup.tsx'],
      },
      'checkbox-group': {
        name: 'checkbox-group',
        description: 'Checkbox group with min/max selection',
        version: '1.0.0',
        category: 'selection',
        files: ['CheckboxGroup.tsx'],
        peerComponents: ['checkbox'],
      },
      'tree-select': {
        name: 'tree-select',
        description: 'Hierarchical tree selection',
        version: '1.0.0',
        category: 'selection',
        files: ['TreeSelect.tsx'],
      },
      'tag-input': {
        name: 'tag-input',
        description: 'Add and remove tags inline',
        version: '1.0.0',
        category: 'selection',
        files: ['TagInput.tsx'],
      },
      'color-picker': {
        name: 'color-picker',
        description: 'Color picker with palette, hex, and RGB input',
        version: '1.0.0',
        category: 'selection',
        files: ['ColorPicker.tsx'],
      },
      json: {
        name: 'json',
        description: 'Pretty-printed JSON with collapsible nodes',
        version: '1.0.0',
        category: 'data',
        files: ['JSONView.tsx'],
      },
      'virtual-list': {
        name: 'virtual-list',
        description: 'Virtualized list for 10k+ items',
        version: '1.0.0',
        category: 'data',
        files: ['VirtualList.tsx'],
        deps: ['mnemonist'],
      },
      tree: {
        name: 'tree',
        description: 'Expandable/collapsible tree view',
        version: '1.0.0',
        category: 'data',
        files: ['Tree.tsx'],
      },
      'directory-tree': {
        name: 'directory-tree',
        description: 'Filesystem browser with expand/collapse',
        version: '1.0.0',
        category: 'data',
        files: ['DirectoryTree.tsx'],
        deps: ['glob'],
      },
      'key-value': {
        name: 'key-value',
        description: 'Aligned key–value pairs',
        version: '1.0.0',
        category: 'data',
        files: ['KeyValue.tsx'],
      },
      definition: {
        name: 'definition',
        description: 'Term–description definition list',
        version: '1.0.0',
        category: 'data',
        files: ['Definition.tsx'],
      },
      card: {
        name: 'card',
        description: 'Card with header, body, and footer slots',
        version: '1.0.0',
        category: 'data',
        files: ['Card.tsx'],
      },
      'git-status': {
        name: 'git-status',
        description: 'Git status display (branch, staged, modified, ahead/behind)',
        version: '1.0.0',
        category: 'data',
        files: ['GitStatus.tsx'],
      },
      'progress-circle': {
        name: 'progress-circle',
        description: 'Circular progress indicator using Unicode braille',
        version: '1.0.0',
        category: 'feedback',
        files: ['ProgressCircle.tsx'],
      },
      'status-message': {
        name: 'status-message',
        description: 'Inline status message with icon and color',
        version: '1.0.0',
        category: 'feedback',
        files: ['StatusMessage.tsx'],
      },
      toast: {
        name: 'toast',
        description: 'Auto-dismissing toast notification',
        version: '1.0.0',
        category: 'feedback',
        files: ['Toast.tsx'],
      },
      banner: {
        name: 'banner',
        description: 'Full-width announcement banner',
        version: '1.0.0',
        category: 'feedback',
        files: ['Banner.tsx'],
      },
      skeleton: {
        name: 'skeleton',
        description: 'Shimmer loading placeholder',
        version: '1.0.0',
        category: 'feedback',
        files: ['Skeleton.tsx'],
      },
      'tabbed-content': {
        name: 'tabbed-content',
        description: 'Tab bar wired to content panels',
        version: '1.0.0',
        category: 'navigation',
        files: ['TabbedContent.tsx'],
        peerComponents: ['tabs'],
      },
      breadcrumb: {
        name: 'breadcrumb',
        description: 'Breadcrumb navigation trail',
        version: '1.0.0',
        category: 'navigation',
        files: ['Breadcrumb.tsx'],
      },
      pagination: {
        name: 'pagination',
        description: 'Page navigation with prev/next and jump',
        version: '1.0.0',
        category: 'navigation',
        files: ['Pagination.tsx'],
      },
      'command-palette': {
        name: 'command-palette',
        description: 'VS Code–style command palette with fuzzy search',
        version: '1.0.0',
        category: 'navigation',
        files: ['CommandPalette.tsx'],
        deps: ['mnemonist'],
      },
      menu: {
        name: 'menu',
        description: 'Dropdown menu with nested submenus',
        version: '1.0.0',
        category: 'navigation',
        files: ['Menu.tsx'],
      },
      sidebar: {
        name: 'sidebar',
        description: 'Collapsible navigation sidebar panel',
        version: '1.0.0',
        category: 'navigation',
        files: ['Sidebar.tsx'],
      },
      dialog: {
        name: 'dialog',
        description: 'Confirmation dialog with OK/Cancel actions',
        version: '1.0.0',
        category: 'overlays',
        files: ['Dialog.tsx'],
      },
      drawer: {
        name: 'drawer',
        description: 'Slide-in panel from any edge',
        version: '1.0.0',
        category: 'overlays',
        files: ['Drawer.tsx'],
      },
      tooltip: {
        name: 'tooltip',
        description: 'Contextual tooltip on focus or hover',
        version: '1.0.0',
        category: 'overlays',
        files: ['Tooltip.tsx'],
      },
      popover: {
        name: 'popover',
        description: 'Positioned popover with arbitrary content',
        version: '1.0.0',
        category: 'overlays',
        files: ['Popover.tsx'],
      },
      'form-field': {
        name: 'form-field',
        description: 'Form field wrapper with label, hint, and error',
        version: '1.0.0',
        category: 'forms',
        files: ['FormField.tsx'],
        peerComponents: ['form'],
      },
      wizard: {
        name: 'wizard',
        description: 'Multi-step wizard with per-step validation',
        version: '1.0.0',
        category: 'forms',
        files: ['Wizard.tsx'],
      },
      confirm: {
        name: 'confirm',
        description: 'Yes/No confirmation prompt',
        version: '1.0.0',
        category: 'forms',
        files: ['Confirm.tsx'],
      },
      'date-picker': {
        name: 'date-picker',
        description: 'Calendar date picker with keyboard navigation',
        version: '1.0.0',
        category: 'forms',
        files: ['DatePicker.tsx'],
      },
      'time-picker': {
        name: 'time-picker',
        description: 'Time picker with hour/minute/second spinners',
        version: '1.0.0',
        category: 'forms',
        files: ['TimePicker.tsx'],
      },
      'file-picker': {
        name: 'file-picker',
        description: 'Interactive file browser and picker',
        version: '1.0.0',
        category: 'forms',
        files: ['FilePicker.tsx'],
        deps: ['glob'],
      },
      'embedded-terminal': {
        name: 'embedded-terminal',
        description: 'Embedded PTY terminal panel (requires node-pty peer)',
        version: '1.0.0',
        category: 'utility',
        files: ['EmbeddedTerminal.tsx'],
      },
      timer: {
        name: 'timer',
        description: 'Countdown timer with pause/resume and auto-start',
        version: '1.0.0',
        category: 'utility',
        files: ['Timer.tsx'],
      },
      stopwatch: {
        name: 'stopwatch',
        description: 'Count-up stopwatch with laps and reset',
        version: '1.0.0',
        category: 'utility',
        files: ['Stopwatch.tsx'],
      },
      clock: {
        name: 'clock',
        description: 'Real-time clock display with 12h/24h and date',
        version: '1.0.0',
        category: 'utility',
        files: ['Clock.tsx'],
      },
      clipboard: {
        name: 'clipboard',
        description: 'Copy-to-clipboard button with success feedback',
        version: '1.0.0',
        category: 'utility',
        files: ['Clipboard.tsx'],
      },
      'keyboard-shortcuts': {
        name: 'keyboard-shortcuts',
        description: 'Formatted keyboard shortcut reference table',
        version: '1.0.0',
        category: 'utility',
        files: ['KeyboardShortcuts.tsx'],
      },
      help: {
        name: 'help',
        description: 'Auto-generated help panel from a keymap',
        version: '1.0.0',
        category: 'utility',
        files: ['Help.tsx'],
      },
      'error-boundary': {
        name: 'error-boundary',
        description: 'React error boundary with graceful terminal display',
        version: '1.0.0',
        category: 'utility',
        files: ['ErrorBoundary.tsx'],
      },
      log: {
        name: 'log',
        description: 'Scrolling log viewer with severity levels and filtering',
        version: '1.0.0',
        category: 'utility',
        files: ['Log.tsx'],
      },
      image: {
        name: 'image',
        description: 'Image renderer with iTerm2/Kitty protocol and ASCII fallback',
        version: '1.0.0',
        category: 'utility',
        files: ['Image.tsx'],
      },
      'qr-code': {
        name: 'qr-code',
        description: 'Unicode block QR code generator',
        version: '1.0.0',
        category: 'utility',
        files: ['QRCode.tsx'],
      },
      sparkline: {
        name: 'sparkline',
        description: 'Inline Unicode braille sparkline chart',
        version: '1.0.0',
        category: 'charts',
        files: ['Sparkline.tsx'],
      },
      'bar-chart': {
        name: 'bar-chart',
        description: 'Horizontal and vertical bar chart with labels',
        version: '1.0.0',
        category: 'charts',
        files: ['BarChart.tsx'],
      },
      'line-chart': {
        name: 'line-chart',
        description: 'ASCII line chart with axes and multi-series support',
        version: '1.0.0',
        category: 'charts',
        files: ['LineChart.tsx'],
      },
      'pie-chart': {
        name: 'pie-chart',
        description: 'Unicode block pie chart with legend',
        version: '1.0.0',
        category: 'charts',
        files: ['PieChart.tsx'],
      },
      'heat-map': {
        name: 'heat-map',
        description: 'Grid heatmap with color intensity scale',
        version: '1.0.0',
        category: 'charts',
        files: ['HeatMap.tsx'],
      },
      gauge: {
        name: 'gauge',
        description: 'Arc/speedometer gauge meter',
        version: '1.0.0',
        category: 'charts',
        files: ['Gauge.tsx'],
      },
    },
  };
}

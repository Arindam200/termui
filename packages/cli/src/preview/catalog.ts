/**
 * Static component catalog for `npx termui preview`.
 * Each entry has description, props, and a usage snippet.
 */

export interface PropDef {
  name: string;
  type: string;
  required?: boolean;
  default?: string;
}

export interface ComponentEntry {
  name: string;
  description: string;
  props: PropDef[];
  usage: string;
  /** ASCII art lines showing the component rendered in the terminal */
  preview?: string[];
}

export interface Category {
  name: string;
  components: ComponentEntry[];
}

export const CATALOG: Category[] = [
  {
    name: 'Layout',
    components: [
      {
        name: 'Box',
        description: 'Enhanced flexbox container with border presets and Yoga layout.',
        props: [
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'flexDirection', type: "'row' | 'column'", default: "'column'" },
          { name: 'gap', type: 'number' },
          { name: 'borderStyle', type: "'single' | 'double' | 'round' | 'bold'" },
          { name: 'borderColor', type: 'string' },
          { name: 'padding', type: 'number' },
          { name: 'paddingX', type: 'number' },
          { name: 'paddingY', type: 'number' },
          { name: 'width', type: 'number | string' },
          { name: 'height', type: 'number | string' },
          { name: 'alignItems', type: "'flex-start' | 'center' | 'flex-end'" },
          {
            name: 'justifyContent',
            type: "'flex-start' | 'center' | 'flex-end' | 'space-between'",
          },
        ],
        usage: `import { Box } from 'termui/components'

<Box flexDirection="column" borderStyle="round" padding={1}>
  <Text>Content here</Text>
</Box>`,
        preview: [
          '  ╭──────────────────────────╮',
          '  │                          │',
          '  │   Hello from Box!        │',
          '  │                          │',
          '  ╰──────────────────────────╯',
          '',
          '  ╭── row layout ────────────╮',
          '  │ Left   │  Center  │ Right│',
          '  ╰──────────────────────────╯',
        ],
      },
      {
        name: 'Stack',
        description: 'Vertical or horizontal stack with configurable gap.',
        preview: [
          '  direction="column" gap={1}',
          '',
          '  ┌──────────────┐',
          '  │  Item One    │',
          '  ├──────────────┤',
          '  │  Item Two    │',
          '  ├──────────────┤',
          '  │  Item Three  │',
          '  └──────────────┘',
        ],
        props: [
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'direction', type: "'row' | 'column'", default: "'column'" },
          { name: 'gap', type: 'number', default: '1' },
          { name: 'align', type: "'flex-start' | 'center' | 'flex-end'" },
        ],
        usage: `import { Stack } from 'termui/components'

<Stack direction="column" gap={1}>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</Stack>`,
      },
      {
        name: 'Grid',
        description: 'Rows × columns grid layout.',
        preview: [
          '  columns={3} gap={1}',
          '',
          '  ╭──────╮ ╭──────╮ ╭──────╮',
          '  │  A   │ │  B   │ │  C   │',
          '  ╰──────╯ ╰──────╯ ╰──────╯',
          '  ╭──────╮ ╭──────╮ ╭──────╮',
          '  │  D   │ │  E   │ │  F   │',
          '  ╰──────╯ ╰──────╯ ╰──────╯',
        ],
        props: [
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'columns', type: 'number', required: true },
          { name: 'gap', type: 'number', default: '1' },
        ],
        usage: `import { Grid } from 'termui/components'

<Grid columns={3} gap={1}>
  <Text>A</Text><Text>B</Text><Text>C</Text>
</Grid>`,
      },
      {
        name: 'ScrollView',
        description: 'Scrollable container with an optional scrollbar indicator.',
        props: [
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'height', type: 'number', required: true },
          { name: 'showScrollbar', type: 'boolean', default: 'true' },
        ],
        usage: `import { ScrollView } from 'termui/components'

<ScrollView height={10}>
  {longContent}
</ScrollView>`,
      },
      {
        name: 'Divider',
        description: 'Horizontal rule / divider with optional label.',
        props: [
          { name: 'label', type: 'string' },
          { name: 'color', type: 'string' },
          { name: 'char', type: 'string', default: "'─'" },
        ],
        usage: `import { Divider } from 'termui/components'

<Divider label="Section" />`,
      },
      {
        name: 'Spacer',
        description: 'Flexible empty space for pushing content apart.',
        props: [{ name: 'size', type: 'number', default: '1' }],
        usage: `import { Spacer } from 'termui/components'

<Box flexDirection="row">
  <Text>Left</Text>
  <Spacer />
  <Text>Right</Text>
</Box>`,
      },
      {
        name: 'Columns',
        description: 'Equal-width or custom-width column layout.',
        props: [
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'widths', type: 'number[]' },
          { name: 'gap', type: 'number', default: '1' },
        ],
        usage: `import { Columns } from 'termui/components'

<Columns widths={[20, 40]}>
  <Text>Left</Text>
  <Text>Right</Text>
</Columns>`,
      },
      {
        name: 'Center',
        description: 'Centers children horizontally and/or vertically.',
        props: [
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'horizontal', type: 'boolean', default: 'true' },
          { name: 'vertical', type: 'boolean', default: 'false' },
        ],
        usage: `import { Center } from 'termui/components'

<Center>
  <Text>Centered content</Text>
</Center>`,
      },
      {
        name: 'AspectRatio',
        description: 'Maintains a fixed aspect ratio for its child.',
        props: [
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'ratio', type: 'number', required: true },
          { name: 'width', type: 'number' },
        ],
        usage: `import { AspectRatio } from 'termui/components'

<AspectRatio ratio={16/9} width={40}>
  <Box borderStyle="single" />
</AspectRatio>`,
      },
    ],
  },
  {
    name: 'Typography',
    components: [
      {
        name: 'Text',
        description: 'Rich inline text with bold, italic, color, and dimming support.',
        preview: [
          '  Regular text',
          '  Bold text',
          '  Italic text',
          '  Underlined text',
          '  ~~Strikethrough~~',
          '  Colored text  ← cyan',
          '  Dimmed text   ← gray',
        ],
        props: [
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'bold', type: 'boolean' },
          { name: 'italic', type: 'boolean' },
          { name: 'color', type: 'string' },
          { name: 'dimColor', type: 'boolean' },
          { name: 'underline', type: 'boolean' },
          { name: 'strikethrough', type: 'boolean' },
          { name: 'wrap', type: "'wrap' | 'truncate' | 'truncate-end'" },
        ],
        usage: `import { Text } from 'termui/components'

<Text bold color="cyan">Hello, world!</Text>`,
      },
      {
        name: 'Heading',
        description: 'Section heading with h1–h4 levels and optional figlet ASCII art.',
        props: [
          { name: 'children', type: 'string', required: true },
          { name: 'level', type: '1 | 2 | 3 | 4', default: '1' },
          { name: 'ascii', type: 'boolean', default: 'false' },
          { name: 'font', type: 'string', default: "'Standard'" },
          { name: 'color', type: 'string' },
        ],
        usage: `import { Heading } from 'termui/components'

<Heading level={1} color="cyan">My CLI Tool</Heading>
<Heading level={1} ascii font="Big">TITLE</Heading>`,
      },
      {
        name: 'Code',
        description: 'Syntax-highlighted code block with 50+ language support.',
        props: [
          { name: 'children', type: 'string', required: true },
          { name: 'language', type: 'string', default: "'text'" },
          { name: 'showLineNumbers', type: 'boolean', default: 'false' },
          { name: 'theme', type: 'string', default: "'auto'" },
        ],
        usage: `import { Code } from 'termui/components'

<Code language="typescript">
  {'const x: number = 42;'}
</Code>`,
      },
      {
        name: 'Link',
        description: 'Clickable hyperlink using OSC 8 terminal hyperlink protocol.',
        props: [
          { name: 'href', type: 'string', required: true },
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'color', type: 'string' },
        ],
        usage: `import { Link } from 'termui/components'

<Link href="https://termui.dev" color="cyan">
  termui.dev
</Link>`,
      },
      {
        name: 'Badge',
        description: 'Semantic status badge with color presets.',
        preview: ['', '  ● default    ● success', '', '  ● warning    ● error', '', '  ● info'],
        props: [
          { name: 'children', type: 'ReactNode', required: true },
          {
            name: 'variant',
            type: "'default' | 'success' | 'warning' | 'error' | 'info'",
            default: "'default'",
          },
          { name: 'color', type: 'string' },
        ],
        usage: `import { Badge } from 'termui/components'

<Badge variant="success">Deployed</Badge>
<Badge variant="error">Failed</Badge>`,
      },
      {
        name: 'Tag',
        description: 'Removable chip/tag with optional close callback.',
        props: [
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'onRemove', type: '() => void' },
          { name: 'color', type: 'string' },
        ],
        usage: `import { Tag } from 'termui/components'

<Tag onRemove={() => remove('typescript')}>
  typescript
</Tag>`,
      },
      {
        name: 'Markdown',
        description: 'Full Markdown renderer — headings, bold, italic, code, lists, links.',
        props: [
          { name: 'children', type: 'string', required: true },
          { name: 'theme', type: 'MarkdownTheme' },
        ],
        usage: `import { Markdown } from 'termui/components'

<Markdown>{'# Hello\\n\\nThis is **bold** text.'}</Markdown>`,
      },
      {
        name: 'JSON',
        description: 'Pretty-print JSON with syntax coloring and collapsible nodes.',
        props: [
          { name: 'value', type: 'unknown', required: true },
          { name: 'indent', type: 'number', default: '2' },
          { name: 'collapsed', type: 'boolean', default: 'false' },
        ],
        usage: `import { JSONView } from 'termui/components'

<JSONView value={{ name: 'Alice', age: 30 }} />`,
      },
      {
        name: 'Gradient',
        description: 'Renders text with a smooth color gradient.',
        props: [
          { name: 'children', type: 'string', required: true },
          { name: 'colors', type: 'string[]', required: true },
        ],
        usage: `import { Gradient } from 'termui/components'

<Gradient colors={['#ff6b6b', '#4ecdc4']}>
  Gradient Text
</Gradient>`,
      },
      {
        name: 'BigText',
        description: 'Renders large ASCII-art text using figlet fonts.',
        props: [
          { name: 'children', type: 'string', required: true },
          { name: 'font', type: 'string', default: "'Standard'" },
          { name: 'color', type: 'string' },
        ],
        usage: `import { BigText } from 'termui/components'

<BigText font="Big" color="cyan">HELLO</BigText>`,
      },
      {
        name: 'Digits',
        description: 'Renders numbers using box-drawing characters.',
        props: [
          { name: 'value', type: 'number | string', required: true },
          { name: 'color', type: 'string' },
          { name: 'size', type: 'number', default: '1' },
        ],
        usage: `import { Digits } from 'termui/components'

<Digits value={42} color="green" />`,
      },
    ],
  },
  {
    name: 'Input',
    components: [
      {
        name: 'TextInput',
        description: 'Single-line input with placeholder, validation, and optional masking.',
        preview: [
          '  placeholder:',
          '  ┌──────────────────────────┐',
          '  │  Enter your name…        │',
          '  └──────────────────────────┘',
          '',
          '  focused + value:',
          '  ┌──────────────────────────┐',
          '  │  Alice▌                  │',
          '  └──────────────────────────┘',
        ],
        props: [
          { name: 'value', type: 'string', required: true },
          { name: 'onChange', type: '(value: string) => void', required: true },
          { name: 'onSubmit', type: '(value: string) => void' },
          { name: 'placeholder', type: 'string' },
          { name: 'mask', type: 'string' },
          { name: 'focus', type: 'boolean' },
          { name: 'validate', type: '(value: string) => string | null' },
        ],
        usage: `import { TextInput } from 'termui/components'

const [value, setValue] = useState('');
<TextInput
  value={value}
  onChange={setValue}
  onSubmit={(v) => console.log(v)}
  placeholder="Enter name..."
/>`,
      },
      {
        name: 'TextArea',
        description: 'Multi-line text editor with scrolling and line wrapping.',
        props: [
          { name: 'value', type: 'string', required: true },
          { name: 'onChange', type: '(value: string) => void', required: true },
          { name: 'placeholder', type: 'string' },
          { name: 'rows', type: 'number', default: '5' },
          { name: 'focus', type: 'boolean' },
        ],
        usage: `import { TextArea } from 'termui/components'

<TextArea
  value={text}
  onChange={setText}
  placeholder="Write here..."
  rows={6}
/>`,
      },
      {
        name: 'PasswordInput',
        description: 'Masked password input with reveal toggle.',
        preview: [
          '  masked:',
          '  ┌──────────────────────────┐',
          '  │  ••••••••▌               │',
          '  └──────────────────────────┘',
          '',
          '  revealed (toggle with Tab):',
          '  ┌──────────────────────────┐',
          '  │  hunter2▌                │',
          '  └──────────────────────────┘',
        ],
        props: [
          { name: 'value', type: 'string', required: true },
          { name: 'onChange', type: '(value: string) => void', required: true },
          { name: 'onSubmit', type: '(value: string) => void' },
          { name: 'placeholder', type: 'string', default: "'Password...'" },
          { name: 'mask', type: 'string', default: "'•'" },
          { name: 'showToggle', type: 'boolean', default: 'true' },
        ],
        usage: `import { PasswordInput } from 'termui/components'

<PasswordInput
  value={pass}
  onChange={setPass}
  placeholder="Enter password..."
/>`,
      },
      {
        name: 'NumberInput',
        description: 'Numeric input with ↑↓ increment/decrement and min/max clamping.',
        props: [
          { name: 'value', type: 'number', required: true },
          { name: 'onChange', type: '(value: number) => void', required: true },
          { name: 'min', type: 'number' },
          { name: 'max', type: 'number' },
          { name: 'step', type: 'number', default: '1' },
        ],
        usage: `import { NumberInput } from 'termui/components'

<NumberInput
  value={count}
  onChange={setCount}
  min={0} max={100}
/>`,
      },
      {
        name: 'SearchInput',
        description: 'Fuzzy-search input with autocomplete dropdown.',
        props: [
          { name: 'value', type: 'string', required: true },
          { name: 'onChange', type: '(value: string) => void', required: true },
          { name: 'onSelect', type: '(item: string) => void' },
          { name: 'options', type: 'string[]', required: true },
          { name: 'placeholder', type: 'string' },
          { name: 'maxResults', type: 'number', default: '5' },
        ],
        usage: `import { SearchInput } from 'termui/components'

<SearchInput
  value={query}
  onChange={setQuery}
  onSelect={handleSelect}
  options={['Apple', 'Banana', 'Cherry']}
/>`,
      },
      {
        name: 'MaskedInput',
        description: 'Format-constrained input for phone, date, credit card patterns.',
        props: [
          { name: 'value', type: 'string', required: true },
          { name: 'onChange', type: '(value: string) => void', required: true },
          { name: 'mask', type: 'string', required: true },
          { name: 'placeholder', type: 'string' },
        ],
        usage: `import { MaskedInput } from 'termui/components'

<MaskedInput
  value={phone}
  onChange={setPhone}
  mask="(999) 999-9999"
/>`,
      },
      {
        name: 'EmailInput',
        description: 'Email input with domain autocomplete and inline validation.',
        props: [
          { name: 'value', type: 'string', required: true },
          { name: 'onChange', type: '(value: string) => void', required: true },
          { name: 'onSubmit', type: '(value: string) => void' },
          { name: 'suggestions', type: 'string[]', default: "['gmail.com', 'yahoo.com', ...]" },
        ],
        usage: `import { EmailInput } from 'termui/components'

<EmailInput
  value={email}
  onChange={setEmail}
  onSubmit={handleSubmit}
/>`,
      },
      {
        name: 'PathInput',
        description: 'Filesystem path input with Tab autocomplete.',
        props: [
          { name: 'value', type: 'string', required: true },
          { name: 'onChange', type: '(value: string) => void', required: true },
          { name: 'onSubmit', type: '(value: string) => void' },
          { name: 'cwd', type: 'string', default: 'process.cwd()' },
          { name: 'showHidden', type: 'boolean', default: 'false' },
        ],
        usage: `import { PathInput } from 'termui/components'

<PathInput
  value={path}
  onChange={setPath}
  onSubmit={handleSubmit}
/>`,
      },
    ],
  },
  {
    name: 'Selection',
    components: [
      {
        name: 'Select',
        description: 'Single-select dropdown with keyboard search and grouping.',
        preview: [
          '  Choose a framework:',
          '',
          '  ▸ React',
          '    Vue',
          '    Svelte',
          '    Angular',
          '',
          '  ↑↓ navigate  Enter select',
        ],
        props: [
          { name: 'options', type: 'SelectOption[]', required: true },
          { name: 'value', type: 'string' },
          { name: 'onChange', type: '(value: string) => void' },
          { name: 'onSubmit', type: '(value: string) => void' },
          { name: 'placeholder', type: 'string' },
          { name: 'searchable', type: 'boolean', default: 'false' },
        ],
        usage: `import { Select } from 'termui/components'

<Select
  options={[
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
  ]}
  onChange={handleChange}
/>`,
      },
      {
        name: 'MultiSelect',
        description: 'Multi-select list with Space to toggle, Enter to submit.',
        preview: [
          '  Pick your stack:',
          '',
          '  ▸ ◉ TypeScript    ✓ selected',
          '    ◉ React         ✓ selected',
          '    ○ Vue',
          '    ○ Svelte',
          '',
          '  Space toggle  Enter confirm',
        ],
        props: [
          { name: 'options', type: 'MultiSelectOption[]', required: true },
          { name: 'value', type: 'T[]' },
          { name: 'onChange', type: '(values: T[]) => void' },
          { name: 'onSubmit', type: '(values: T[]) => void' },
          { name: 'cursor', type: 'string', default: "'›'" },
          { name: 'checkmark', type: 'string', default: "'◉'" },
          { name: 'height', type: 'number' },
        ],
        usage: `import { MultiSelect } from 'termui/components'

<MultiSelect
  options={options}
  onChange={setSelected}
  onSubmit={handleSubmit}
/>`,
      },
      {
        name: 'RadioGroup',
        description: 'Mutually-exclusive radio button group.',
        props: [
          { name: 'options', type: 'RadioOption[]', required: true },
          { name: 'value', type: 'T' },
          { name: 'onChange', type: '(value: T) => void' },
          { name: 'cursor', type: 'string', default: "'›'" },
        ],
        usage: `import { RadioGroup } from 'termui/components'

<RadioGroup
  options={[
    { value: 'light', label: 'Light mode' },
    { value: 'dark', label: 'Dark mode' },
  ]}
  onChange={setTheme}
/>`,
      },
      {
        name: 'Checkbox',
        description: 'Single checkbox with indeterminate state support.',
        props: [
          { name: 'checked', type: 'boolean', required: true },
          { name: 'onChange', type: '(checked: boolean) => void' },
          { name: 'label', type: 'string' },
          { name: 'indeterminate', type: 'boolean' },
          { name: 'disabled', type: 'boolean' },
        ],
        usage: `import { Checkbox } from 'termui/components'

<Checkbox
  checked={accepted}
  onChange={setAccepted}
  label="I accept the terms"
/>`,
      },
      {
        name: 'CheckboxGroup',
        description: 'Group of checkboxes with optional min/max selection constraints.',
        preview: [
          '  Features  (select 1–3)',
          '',
          '  ▸ ☑  TypeScript',
          '    ☑  ESLint',
          '    ☐  Prettier',
          '    ☐  Husky',
          '',
          '  2 of 3 max selected',
        ],
        props: [
          { name: 'options', type: 'CheckboxGroupOption[]', required: true },
          { name: 'value', type: 'string[]' },
          { name: 'onChange', type: '(values: string[]) => void' },
          { name: 'label', type: 'string' },
          { name: 'min', type: 'number' },
          { name: 'max', type: 'number' },
        ],
        usage: `import { CheckboxGroup } from 'termui/components'

<CheckboxGroup
  label="Features"
  options={featureOptions}
  onChange={setFeatures}
  min={1} max={3}
/>`,
      },
      {
        name: 'Toggle',
        description: 'On/off toggle switch.',
        props: [
          { name: 'value', type: 'boolean', required: true },
          { name: 'onChange', type: '(value: boolean) => void' },
          { name: 'label', type: 'string' },
          { name: 'onLabel', type: 'string', default: "'ON'" },
          { name: 'offLabel', type: 'string', default: "'OFF'" },
        ],
        usage: `import { Toggle } from 'termui/components'

<Toggle
  value={enabled}
  onChange={setEnabled}
  label="Notifications"
/>`,
      },
      {
        name: 'TreeSelect',
        description: 'Hierarchical tree selection with expand/collapse.',
        props: [
          { name: 'nodes', type: 'TreeSelectNode[]', required: true },
          { name: 'value', type: 'T' },
          { name: 'onChange', type: '(value: T) => void' },
          { name: 'expandedByDefault', type: 'boolean', default: 'false' },
        ],
        usage: `import { TreeSelect } from 'termui/components'

<TreeSelect
  nodes={treeData}
  onChange={setValue}
  expandedByDefault
/>`,
      },
      {
        name: 'TagInput',
        description: 'Multi-tag input — type and press Enter to add, Backspace to remove.',
        preview: [
          '  ┌────────────────────────────────────┐',
          '  │ [typescript] [react] [cli] next▌   │',
          '  └────────────────────────────────────┘',
          '',
          '  Enter to add  Backspace to remove',
        ],
        props: [
          { name: 'value', type: 'string[]' },
          { name: 'onChange', type: '(tags: string[]) => void' },
          { name: 'placeholder', type: 'string', default: "'Type and press Enter…'" },
          { name: 'maxTags', type: 'number' },
        ],
        usage: `import { TagInput } from 'termui/components'

<TagInput
  value={tags}
  onChange={setTags}
  maxTags={5}
/>`,
      },
      {
        name: 'ColorPicker',
        description: 'Color palette picker with hex/RGB input.',
        props: [
          { name: 'value', type: 'string' },
          { name: 'onChange', type: '(color: string) => void' },
          { name: 'palette', type: 'string[]' },
          { name: 'format', type: "'hex' | 'rgb'", default: "'hex'" },
        ],
        usage: `import { ColorPicker } from 'termui/components'

<ColorPicker
  value={color}
  onChange={setColor}
/>`,
      },
    ],
  },
  {
    name: 'Data Display',
    components: [
      {
        name: 'Table',
        description: 'Sortable, filterable, paginated data table with column config.',
        preview: [
          '  ┌────┬───────────┬──────┬────────┐',
          '  │ #  │ Name    ↑ │ Age  │ Role   │',
          '  ├────┼───────────┼──────┼────────┤',
          '  │ 1  │ Alice     │  30  │ Admin  │',
          '  │ 2  │ Bob       │  25  │ User   │',
          '  │ 3  │ Carol     │  28  │ User   │',
          '  └────┴───────────┴──────┴────────┘',
          '  Page 1/4  ↑↓ navigate  s sort',
        ],
        props: [
          { name: 'columns', type: 'ColumnDef[]', required: true },
          { name: 'data', type: 'Record<string, unknown>[]', required: true },
          { name: 'pageSize', type: 'number', default: '10' },
          { name: 'sortable', type: 'boolean', default: 'true' },
          { name: 'filterable', type: 'boolean', default: 'false' },
          { name: 'onRowSelect', type: '(row: Record<string, unknown>) => void' },
        ],
        usage: `import { Table } from 'termui/components'

<Table
  columns={[{ key: 'name', header: 'Name' }]}
  data={[{ name: 'Alice' }, { name: 'Bob' }]}
  pageSize={5}
/>`,
      },
      {
        name: 'DataGrid',
        description: 'Editable data grid with inline cell editing.',
        props: [
          { name: 'columns', type: 'GridColumn[]', required: true },
          { name: 'data', type: 'Record<string, unknown>[]', required: true },
          { name: 'onCellChange', type: '(row: number, col: string, value: unknown) => void' },
          { name: 'editable', type: 'boolean', default: 'false' },
        ],
        usage: `import { DataGrid } from 'termui/components'

<DataGrid columns={cols} data={rows} editable />`,
      },
      {
        name: 'List',
        description: 'Navigable list with optional filtering and item selection.',
        props: [
          { name: 'items', type: 'ListItem[]', required: true },
          { name: 'onSelect', type: '(item: ListItem) => void' },
          { name: 'filterable', type: 'boolean', default: 'false' },
          { name: 'renderItem', type: '(item: ListItem, active: boolean) => ReactNode' },
        ],
        usage: `import { List } from 'termui/components'

<List
  items={[{ id: '1', label: 'Item 1' }]}
  onSelect={handleSelect}
/>`,
      },
      {
        name: 'VirtualList',
        description: 'Virtualized list for 10k+ items with a fixed viewport.',
        props: [
          { name: 'items', type: 'T[]', required: true },
          { name: 'height', type: 'number', required: true },
          { name: 'renderItem', type: '(item: T, index: number) => ReactNode', required: true },
          { name: 'onSelect', type: '(item: T) => void' },
        ],
        usage: `import { VirtualList } from 'termui/components'

<VirtualList
  items={largeArray}
  height={20}
  renderItem={(item) => <Text>{item.name}</Text>}
/>`,
      },
      {
        name: 'Tree',
        description: 'Expandable/collapsible tree view.',
        props: [
          { name: 'nodes', type: 'TreeNode[]', required: true },
          { name: 'onSelect', type: '(node: TreeNode) => void' },
          { name: 'expandedByDefault', type: 'boolean', default: 'false' },
          { name: 'renderLabel', type: '(node: TreeNode) => ReactNode' },
        ],
        usage: `import { Tree } from 'termui/components'

<Tree nodes={treeData} onSelect={handleSelect} />`,
      },
      {
        name: 'DirectoryTree',
        description: 'Filesystem browser tree using glob patterns.',
        props: [
          { name: 'root', type: 'string', required: true },
          { name: 'onSelect', type: '(path: string) => void' },
          { name: 'showHidden', type: 'boolean', default: 'false' },
          { name: 'filter', type: 'string' },
        ],
        usage: `import { DirectoryTree } from 'termui/components'

<DirectoryTree
  root={process.cwd()}
  onSelect={(path) => console.log(path)}
/>`,
      },
      {
        name: 'KeyValue',
        description: 'Aligned key-value pair display.',
        props: [
          { name: 'data', type: 'Record<string, ReactNode>', required: true },
          { name: 'keyWidth', type: 'number' },
          { name: 'separator', type: 'string', default: "':'" },
          { name: 'keyColor', type: 'string' },
        ],
        usage: `import { KeyValue } from 'termui/components'

<KeyValue
  data={{ version: '1.0.0', author: 'Alice' }}
  keyColor="cyan"
/>`,
      },
      {
        name: 'Definition',
        description: 'Term-description pair list (like a glossary).',
        props: [
          { name: 'items', type: 'DefinitionItem[]', required: true },
          { name: 'termWidth', type: 'number' },
          { name: 'termColor', type: 'string' },
        ],
        usage: `import { Definition } from 'termui/components'

<Definition
  items={[{ term: '--verbose', description: 'Enable verbose output' }]}
/>`,
      },
      {
        name: 'Card',
        description: 'Bordered card with header, body, and footer slots.',
        preview: [
          '  ╭─ Summary ───────────────╮',
          '  │                         │',
          '  │  Total items:    42     │',
          '  │  Completed:      38     │',
          '  │  Pending:         4     │',
          '  │                         │',
          '  ├─────────────────────────┤',
          '  │  Updated 2 mins ago     │',
          '  ╰─────────────────────────╯',
        ],
        props: [
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'title', type: 'string' },
          { name: 'footer', type: 'ReactNode' },
          { name: 'borderStyle', type: "'single' | 'double' | 'round' | 'bold'" },
          { name: 'borderColor', type: 'string' },
          { name: 'padding', type: 'number', default: '1' },
        ],
        usage: `import { Card } from 'termui/components'

<Card title="Summary" borderStyle="round">
  <Text>Card content here</Text>
</Card>`,
      },
      {
        name: 'Panel',
        description: 'Titled panel with a border and optional padding.',
        props: [
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'title', type: 'string' },
          { name: 'borderStyle', type: "'single' | 'double' | 'round' | 'bold'" },
          { name: 'borderColor', type: 'string' },
          { name: 'paddingX', type: 'number', default: '1' },
          { name: 'paddingY', type: 'number', default: '0' },
        ],
        usage: `import { Panel } from 'termui/components'

<Panel title="Output" borderStyle="round" borderColor="cyan">
  <Text>Content</Text>
</Panel>`,
      },
    ],
  },
  {
    name: 'Feedback',
    components: [
      {
        name: 'Spinner',
        description: 'Animated loading spinner with 12+ animation styles.',
        preview: [
          '  style="dots"',
          '  ⠙ Loading files...',
          '',
          '  style="line"',
          '  | Processing...',
          '',
          '  style="clock"',
          '  🕒 Installing packages...',
          '',
          '  style="bounce"',
          '  ⡆ Building...',
        ],
        props: [
          { name: 'label', type: 'string' },
          {
            name: 'style',
            type: "'dots' | 'line' | 'circle' | 'bounce' | 'clock' | ...",
            default: "'dots'",
          },
          { name: 'color', type: 'string' },
          { name: 'fps', type: 'number', default: '12' },
        ],
        usage: `import { Spinner } from 'termui/components'

<Spinner label="Loading..." style="dots" color="cyan" />`,
      },
      {
        name: 'ProgressBar',
        description: 'Determinate progress bar with optional ETA display.',
        preview: [
          '  Installing   ████████████░░░░░░░░  60%',
          '  Building     ██████████████████░░  90%',
          '  Uploading    ████░░░░░░░░░░░░░░░░  22%',
          '',
          '  showEta=true:',
          '  Fetching     ████████░░░░░░░░░░░░  42%  ETA 8s',
        ],
        props: [
          { name: 'value', type: 'number', required: true },
          { name: 'max', type: 'number', default: '100' },
          { name: 'width', type: 'number', default: '40' },
          { name: 'label', type: 'string' },
          { name: 'showPercent', type: 'boolean', default: 'true' },
          { name: 'showEta', type: 'boolean', default: 'false' },
          { name: 'color', type: 'string' },
        ],
        usage: `import { ProgressBar } from 'termui/components'

<ProgressBar value={progress} max={100} label="Installing" showEta />`,
      },
      {
        name: 'ProgressCircle',
        description: 'Circular progress indicator using Unicode braille characters.',
        props: [
          { name: 'value', type: 'number', required: true },
          { name: 'max', type: 'number', default: '100' },
          { name: 'color', type: 'string' },
          { name: 'label', type: 'string' },
        ],
        usage: `import { ProgressCircle } from 'termui/components'

<ProgressCircle value={75} label="75%" color="green" />`,
      },
      {
        name: 'StatusMessage',
        description: 'Inline status with icon — success, error, warning, info.',
        props: [
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'variant', type: "'success' | 'error' | 'warning' | 'info'", required: true },
          { name: 'icon', type: 'string' },
        ],
        usage: `import { StatusMessage } from 'termui/components'

<StatusMessage variant="success">Deployed successfully</StatusMessage>
<StatusMessage variant="error">Build failed</StatusMessage>`,
      },
      {
        name: 'Toast',
        description: 'Auto-dismissing notification with configurable duration.',
        props: [
          { name: 'message', type: 'string', required: true },
          {
            name: 'variant',
            type: "'default' | 'success' | 'error' | 'warning'",
            default: "'default'",
          },
          { name: 'duration', type: 'number', default: '3000' },
          { name: 'onDismiss', type: '() => void' },
        ],
        usage: `import { Toast } from 'termui/components'

<Toast
  message="Saved!"
  variant="success"
  duration={2000}
  onDismiss={() => setShow(false)}
/>`,
      },
      {
        name: 'Alert',
        description: 'Success / error / warning / info alert box.',
        preview: [
          '  ╭─ ✓ Success ─────────────────╮',
          '  │  Deployment complete.        │',
          '  ╰─────────────────────────────╯',
          '  ╭─ ✕ Error ───────────────────╮',
          '  │  Build failed. See logs.    │',
          '  ╰─────────────────────────────╯',
          '  ╭─ ⚠ Warning ─────────────────╮',
          '  │  This cannot be undone.     │',
          '  ╰─────────────────────────────╯',
        ],
        props: [
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'variant', type: "'success' | 'error' | 'warning' | 'info'", default: "'info'" },
          { name: 'title', type: 'string' },
          { name: 'icon', type: 'string' },
        ],
        usage: `import { Alert } from 'termui/components'

<Alert variant="warning" title="Heads up">
  This action cannot be undone.
</Alert>`,
      },
      {
        name: 'Banner',
        description: 'Full-width announcement banner.',
        props: [
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'variant', type: "'default' | 'success' | 'error' | 'warning' | 'info'" },
          { name: 'icon', type: 'string' },
          { name: 'dismissible', type: 'boolean', default: 'false' },
        ],
        usage: `import { Banner } from 'termui/components'

<Banner variant="info" icon="ℹ">
  New version available: v2.0.0
</Banner>`,
      },
      {
        name: 'Skeleton',
        description: 'Shimmer placeholder shown while content loads.',
        props: [
          { name: 'width', type: 'number | string', required: true },
          { name: 'height', type: 'number', default: '1' },
          { name: 'animated', type: 'boolean', default: 'true' },
        ],
        usage: `import { Skeleton } from 'termui/components'

{loading ? <Skeleton width={30} height={3} /> : <Content />}`,
      },
    ],
  },
  {
    name: 'Navigation',
    components: [
      {
        name: 'Tabs',
        description: 'Horizontal tab bar with keyboard navigation (← →).',
        preview: [
          '  ╭────────╮ ─────────  ─────────',
          '  │  Home  │  Settings    About',
          '  ╰────────╯',
          '  ┌─────────────────────────────┐',
          '  │                             │',
          '  │   Home content here         │',
          '  │                             │',
          '  └─────────────────────────────┘',
          '  ← → to switch tabs',
        ],
        props: [
          { name: 'tabs', type: 'Tab[]', required: true },
          { name: 'defaultTab', type: 'string' },
          { name: 'activeTab', type: 'string' },
          { name: 'onTabChange', type: '(key: string) => void' },
          { name: 'borderStyle', type: "'single' | 'double' | 'round' | 'bold'" },
        ],
        usage: `import { Tabs } from 'termui/components'

<Tabs
  tabs={[
    { key: 'home', label: 'Home', content: <Home /> },
    { key: 'settings', label: 'Settings', content: <Settings /> },
  ]}
/>`,
      },
      {
        name: 'TabbedContent',
        description: 'Tabs + content panels with shared keyboard control.',
        props: [
          { name: 'tabs', type: 'Tab[]', required: true },
          { name: 'activeTab', type: 'string' },
          { name: 'onTabChange', type: '(key: string) => void' },
        ],
        usage: `import { TabbedContent } from 'termui/components'

<TabbedContent tabs={tabs} />`,
      },
      {
        name: 'Breadcrumb',
        description: 'Navigation breadcrumb trail with ← to go back.',
        preview: ['', '  Home  ›  Docs  ›  Components  ›  Breadcrumb', '', '  ← to navigate back'],
        props: [
          { name: 'items', type: 'BreadcrumbItem[]', required: true },
          { name: 'separator', type: 'string', default: "'›'" },
          { name: 'activeKey', type: 'string' },
        ],
        usage: `import { Breadcrumb } from 'termui/components'

<Breadcrumb
  items={[
    { key: 'home', label: 'Home' },
    { key: 'docs', label: 'Docs' },
    { key: 'api', label: 'API Reference' },
  ]}
/>`,
      },
      {
        name: 'Pagination',
        description: 'Page navigator with ← → keys and smart ellipsis.',
        preview: ['', '  [←]  1  …  4  [5]  6  …  20  [→]', '', '  ← → or h l to change page'],
        props: [
          { name: 'total', type: 'number', required: true },
          { name: 'current', type: 'number', required: true },
          { name: 'onChange', type: '(page: number) => void' },
          { name: 'siblings', type: 'number', default: '1' },
          { name: 'showEdges', type: 'boolean', default: 'true' },
        ],
        usage: `import { Pagination } from 'termui/components'

<Pagination
  total={20}
  current={page}
  onChange={setPage}
/>`,
      },
      {
        name: 'CommandPalette',
        description: 'VS Code–style Ctrl+P command palette with fuzzy search.',
        preview: [
          '  ╭───────────────────────────────╮',
          '  │ > Open file…                  │',
          '  ├───────────────────────────────┤',
          '  │ ▸ Open File             ⌘O   │',
          '  │   Save                  ⌘S   │',
          '  │   Find in Files         ⌘⇧F  │',
          '  │   Toggle Theme                │',
          '  │   Quit                  q     │',
          '  ╰───────────────────────────────╯',
        ],
        props: [
          { name: 'commands', type: 'Command[]', required: true },
          { name: 'isOpen', type: 'boolean', required: true },
          { name: 'onClose', type: '() => void', required: true },
          { name: 'onSelect', type: '(command: Command) => void', required: true },
          { name: 'placeholder', type: 'string', default: "'Search commands…'" },
        ],
        usage: `import { CommandPalette } from 'termui/components'

<CommandPalette
  commands={cmds}
  isOpen={open}
  onClose={() => setOpen(false)}
  onSelect={runCommand}
/>`,
      },
      {
        name: 'Menu',
        description: 'Vertical menu with nested submenus and keyboard nav.',
        props: [
          { name: 'items', type: 'MenuItem[]', required: true },
          { name: 'onSelect', type: '(item: MenuItem) => void' },
          { name: 'title', type: 'string' },
        ],
        usage: `import { Menu } from 'termui/components'

<Menu
  items={menuItems}
  onSelect={(item) => console.log(item.key)}
/>`,
      },
      {
        name: 'Sidebar',
        description: 'Collapsible navigation sidebar with nested items.',
        props: [
          { name: 'items', type: 'SidebarItem[]', required: true },
          { name: 'activeKey', type: 'string' },
          { name: 'onSelect', type: '(key: string) => void' },
          { name: 'collapsed', type: 'boolean', default: 'false' },
          { name: 'width', type: 'number', default: '24' },
          { name: 'title', type: 'string' },
        ],
        usage: `import { Sidebar } from 'termui/components'

<Sidebar
  items={navItems}
  activeKey={current}
  onSelect={navigate}
  title="Navigation"
/>`,
      },
    ],
  },
  {
    name: 'Overlays',
    components: [
      {
        name: 'Modal',
        description: 'Focus-trapped overlay with Esc to close.',
        preview: [
          '  ╔══════════════════════════╗',
          '  ║  Confirm Action          ║',
          '  ╠══════════════════════════╣',
          '  ║                          ║',
          '  ║  Are you sure you want   ║',
          '  ║  to delete this file?    ║',
          '  ║                          ║',
          '  ║  Esc to close            ║',
          '  ╚══════════════════════════╝',
        ],
        props: [
          { name: 'open', type: 'boolean', required: true },
          { name: 'onClose', type: '() => void', required: true },
          { name: 'title', type: 'string' },
          { name: 'children', type: 'ReactNode' },
          { name: 'width', type: 'number' },
          { name: 'closeHint', type: 'string | false', default: "'Esc to close'" },
        ],
        usage: `import { Modal } from 'termui/components'

<Modal open={showModal} onClose={() => setShow(false)} title="Confirm">
  <Text>Are you sure?</Text>
</Modal>`,
      },
      {
        name: 'Dialog',
        description: 'Confirm dialog with OK/Cancel buttons.',
        preview: [
          '  ╔══ Delete file? ═══════════╗',
          '  ║                            ║',
          '  ║  This cannot be undone.   ║',
          '  ║                            ║',
          '  ║   [ Cancel ]  [ Delete ]  ║',
          '  ╚════════════════════════════╝',
          '',
          '  ← → or Tab to switch buttons',
          '  Enter to confirm',
        ],
        props: [
          { name: 'title', type: 'string' },
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'confirmLabel', type: 'string', default: "'OK'" },
          { name: 'cancelLabel', type: 'string', default: "'Cancel'" },
          { name: 'onConfirm', type: '() => void' },
          { name: 'onCancel', type: '() => void' },
          { name: 'variant', type: "'default' | 'danger'", default: "'default'" },
          { name: 'isOpen', type: 'boolean', default: 'false' },
        ],
        usage: `import { Dialog } from 'termui/components'

<Dialog
  title="Delete file?"
  variant="danger"
  isOpen={open}
  onConfirm={deleteFile}
  onCancel={() => setOpen(false)}
>
  This cannot be undone.
</Dialog>`,
      },
      {
        name: 'Drawer',
        description: 'Slide-in panel from any edge (top/right/bottom/left).',
        props: [
          { name: 'open', type: 'boolean', required: true },
          { name: 'onClose', type: '() => void', required: true },
          { name: 'position', type: "'top' | 'right' | 'bottom' | 'left'", default: "'right'" },
          { name: 'children', type: 'ReactNode' },
          { name: 'title', type: 'string' },
          { name: 'size', type: 'number' },
        ],
        usage: `import { Drawer } from 'termui/components'

<Drawer
  open={drawerOpen}
  onClose={() => setDrawer(false)}
  position="right"
  title="Settings"
>
  <SettingsForm />
</Drawer>`,
      },
      {
        name: 'Tooltip',
        description: 'Contextual tooltip rendered above/below/left/right of its trigger.',
        props: [
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'content', type: 'string', required: true },
          { name: 'position', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'" },
          { name: 'isVisible', type: 'boolean' },
          { name: 'borderStyle', type: "'single' | 'double' | 'round' | 'bold'" },
        ],
        usage: `import { Tooltip } from 'termui/components'

<Tooltip content="Click to copy" position="top">
  <Text>[ Copy ]</Text>
</Tooltip>`,
      },
      {
        name: 'Popover',
        description: 'Positioned overlay panel anchored to a trigger element.',
        props: [
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'content', type: 'ReactNode', required: true },
          { name: 'isOpen', type: 'boolean', required: true },
          { name: 'onClose', type: '() => void' },
          { name: 'position', type: "'top' | 'bottom' | 'left' | 'right'", default: "'bottom'" },
        ],
        usage: `import { Popover } from 'termui/components'

<Popover
  isOpen={open}
  onClose={() => setOpen(false)}
  content={<MenuItems />}
>
  <Text>[ Open ]</Text>
</Popover>`,
      },
    ],
  },
  {
    name: 'Forms',
    components: [
      {
        name: 'Form',
        description: 'Form context with validation, dirty tracking. Ctrl+S to submit.',
        preview: [
          '  ╭─ User Details ─────────────────╮',
          '  │                                 │',
          '  │  Name *   ┌─────────────────┐  │',
          '  │           │ Alice▌           │  │',
          '  │           └─────────────────┘  │',
          '  │  Email    ┌─────────────────┐  │',
          '  │           │ alice@acme.com   │  │',
          '  │           └─────────────────┘  │',
          '  │                    [Ctrl+S] ✓  │',
          '  ╰─────────────────────────────────╯',
        ],
        props: [
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'onSubmit', type: '(values: Record<string, unknown>) => void', required: true },
          { name: 'initialValues', type: 'Record<string, unknown>' },
          { name: 'fields', type: 'FormField[]' },
        ],
        usage: `import { Form, FormField, TextInput } from 'termui/components'

<Form
  onSubmit={(values) => console.log(values)}
  fields={[{ name: 'name', validate: (v) => v ? null : 'Required' }]}
>
  <FormField name="name" label="Name">
    <TextInput value={name} onChange={setName} />
  </FormField>
</Form>`,
      },
      {
        name: 'FormField',
        description: 'Label + error wrapper for form inputs.',
        props: [
          { name: 'name', type: 'string', required: true },
          { name: 'label', type: 'string' },
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'error', type: 'string' },
          { name: 'hint', type: 'string' },
          { name: 'required', type: 'boolean' },
        ],
        usage: `import { FormField } from 'termui/components'

<FormField name="email" label="Email" required>
  <EmailInput value={email} onChange={setEmail} />
</FormField>`,
      },
      {
        name: 'Wizard',
        description: 'Multi-step form wizard with validation per step.',
        preview: [
          '  ● Name ──── ● Email ──── ○ Confirm',
          '  ─────────────────────────────────',
          '  Step 2 of 3: Email Address',
          '',
          '  Email *  ┌────────────────────┐',
          '           │ alice@example.com▌ │',
          '           └────────────────────┘',
          '',
          '  [← Back]                [Next →]',
        ],
        props: [
          { name: 'steps', type: 'WizardStep[]', required: true },
          { name: 'onComplete', type: '(completedSteps: string[]) => void' },
          { name: 'onCancel', type: '() => void' },
          { name: 'showProgress', type: 'boolean', default: 'true' },
        ],
        usage: `import { Wizard } from 'termui/components'

<Wizard
  steps={[
    { key: 'name', title: 'Name', content: <NameStep /> },
    { key: 'email', title: 'Email', content: <EmailStep /> },
  ]}
  onComplete={(steps) => console.log('Done!', steps)}
/>`,
      },
      {
        name: 'Confirm',
        description: 'Yes/No inline confirmation prompt.',
        preview: [
          '',
          '  Delete this file?',
          '',
          '  ╭─────────╮  ╭───────────────╮',
          '  │   No    │  │  ▸ Yes        │',
          '  ╰─────────╯  ╰───────────────╯',
          '',
          '  ← → or Tab to switch',
        ],
        props: [
          { name: 'message', type: 'string', required: true },
          { name: 'onConfirm', type: '() => void' },
          { name: 'onCancel', type: '() => void' },
          { name: 'confirmLabel', type: 'string', default: "'Yes'" },
          { name: 'cancelLabel', type: 'string', default: "'No'" },
          { name: 'defaultValue', type: 'boolean', default: 'false' },
          { name: 'variant', type: "'default' | 'danger'", default: "'default'" },
        ],
        usage: `import { Confirm } from 'termui/components'

<Confirm
  message="Delete this file?"
  variant="danger"
  onConfirm={deleteFile}
  onCancel={() => setShow(false)}
/>`,
      },
      {
        name: 'DatePicker',
        description: 'Date picker with month/day/year spinners. Tab to switch fields.',
        preview: [
          '  Select date',
          '',
          '  ┌──────────┐ ┌────┐ ┌──────┐',
          '  │   March  │ │ 22 │ │ 2026 │',
          '  └──────────┘ └────┘ └──────┘',
          '      ↑↓           ↑↓     ↑↓',
          '',
          '  Tab to switch field  Enter to confirm',
        ],
        props: [
          { name: 'value', type: 'Date' },
          { name: 'onChange', type: '(date: Date) => void' },
          { name: 'onSubmit', type: '(date: Date) => void' },
          { name: 'label', type: 'string' },
          { name: 'minDate', type: 'Date' },
          { name: 'maxDate', type: 'Date' },
          { name: 'autoFocus', type: 'boolean', default: 'false' },
        ],
        usage: `import { DatePicker } from 'termui/components'

<DatePicker
  value={date}
  onChange={setDate}
  onSubmit={handleSubmit}
  label="Select date"
/>`,
      },
      {
        name: 'TimePicker',
        description: 'Time picker with hours/minutes spinners. Supports 12h and 24h.',
        preview: [
          '  Select time  (12h format)',
          '',
          '  ┌────┐ : ┌────┐  ┌────┐',
          '  │ 11 │   │ 45 │  │ PM │',
          '  └────┘   └────┘  └────┘',
          '    ↑↓       ↑↓    Space',
          '',
          '  Tab to switch  Enter to confirm',
        ],
        props: [
          { name: 'value', type: '{ hours: number; minutes: number }' },
          { name: 'onChange', type: '(time: { hours: number; minutes: number }) => void' },
          { name: 'label', type: 'string' },
          { name: 'format', type: '12 | 24', default: '24' },
          { name: 'autoFocus', type: 'boolean', default: 'false' },
        ],
        usage: `import { TimePicker } from 'termui/components'

<TimePicker
  value={time}
  onChange={setTime}
  format={12}
  label="Select time"
/>`,
      },
      {
        name: 'FilePicker',
        description: 'File selection dialog with directory browsing.',
        props: [
          { name: 'value', type: 'string' },
          { name: 'onChange', type: '(path: string) => void' },
          { name: 'onSubmit', type: '(path: string) => void' },
          { name: 'root', type: 'string', default: 'process.cwd()' },
          { name: 'filter', type: 'string' },
          { name: 'showHidden', type: 'boolean', default: 'false' },
        ],
        usage: `import { FilePicker } from 'termui/components'

<FilePicker
  onSubmit={(path) => console.log(path)}
  filter="*.json"
/>`,
      },
    ],
  },
  {
    name: 'Charts',
    components: [
      {
        name: 'Sparkline',
        description: 'Inline Unicode braille sparkline chart for numeric series.',
        preview: [
          '  CPU usage (last 60s):',
          '  ▁▂▄▆▃▇█▅▄▆▇▃▂▄▅▆▇▅▃▂  peak: 87%',
          '',
          '  Memory:',
          '  ▃▃▄▄▄▅▅▆▆▇▇▇██▇▆▅▄▄▃  peak: 72%',
          '',
          '  Network:',
          '  ▁▁▁▂▄▇█▅▃▂▁▁▁▂▃▅▆▄▂▁  peak: 12MB',
        ],
        props: [
          { name: 'data', type: 'number[]', required: true },
          { name: 'color', type: 'string' },
          { name: 'height', type: 'number', default: '1' },
        ],
        usage: `import { Sparkline } from 'termui/components'

<Sparkline data={[1, 3, 2, 8, 5, 6]} color="green" />`,
      },
      {
        name: 'BarChart',
        description: 'Horizontal or vertical bar chart.',
        preview: [
          '  JavaScript  ██████████████████  85',
          '  TypeScript  ████████████████    72',
          '  Python      ████████████        55',
          '  Rust        ██████████          48',
          '  Go          ████████            38',
          '',
          '  direction="horizontal"',
        ],
        props: [
          { name: 'data', type: '{ label: string; value: number }[]', required: true },
          { name: 'direction', type: "'horizontal' | 'vertical'", default: "'horizontal'" },
          { name: 'color', type: 'string' },
          { name: 'maxWidth', type: 'number', default: '40' },
          { name: 'showValues', type: 'boolean', default: 'true' },
        ],
        usage: `import { BarChart } from 'termui/components'

<BarChart
  data={[{ label: 'A', value: 10 }, { label: 'B', value: 25 }]}
  color="cyan"
/>`,
      },
      {
        name: 'LineChart',
        description: 'ASCII line chart with axes and multi-series support.',
        preview: [
          '  100 ┤           ╭─╮',
          '   75 ┤      ╭────╯ ╰──╮',
          '   50 ┤  ╭───╯         ╰───',
          '   25 ┤╭─╯',
          '    0 ┼─────────────────────',
          '      Jan  Mar  May  Jul  Sep',
          '',
          '  ── CPU  ── Memory',
        ],
        props: [
          { name: 'series', type: 'Series[]', required: true },
          { name: 'width', type: 'number', default: '60' },
          { name: 'height', type: 'number', default: '15' },
          { name: 'showAxes', type: 'boolean', default: 'true' },
          { name: 'showLegend', type: 'boolean', default: 'true' },
        ],
        usage: `import { LineChart } from 'termui/components'

<LineChart
  series={[{ name: 'CPU', data: cpuData, color: 'cyan' }]}
  width={60} height={15}
/>`,
      },
      {
        name: 'PieChart',
        description: 'Unicode block pie chart with a legend.',
        props: [
          {
            name: 'data',
            type: '{ label: string; value: number; color?: string }[]',
            required: true,
          },
          { name: 'showLegend', type: 'boolean', default: 'true' },
          { name: 'size', type: 'number', default: '10' },
        ],
        usage: `import { PieChart } from 'termui/components'

<PieChart
  data={[
    { label: 'JS', value: 60, color: 'yellow' },
    { label: 'TS', value: 40, color: 'cyan' },
  ]}
/>`,
      },
      {
        name: 'HeatMap',
        description: 'Grid-based heat map with color intensity scaling.',
        props: [
          { name: 'data', type: 'number[][]', required: true },
          { name: 'colorScale', type: 'string[]' },
          { name: 'rowLabels', type: 'string[]' },
          { name: 'colLabels', type: 'string[]' },
        ],
        usage: `import { HeatMap } from 'termui/components'

<HeatMap
  data={matrix}
  rowLabels={['Mon', 'Tue', 'Wed']}
  colLabels={['08:00', '12:00', '16:00']}
/>`,
      },
      {
        name: 'Gauge',
        description: 'Speedometer-style gauge meter.',
        preview: [
          '  CPU   [████████████░░░░░░░░]  60%',
          '  RAM   [██████████████████░░]  91%',
          '  Disk  [████████░░░░░░░░░░░░]  43%',
          '  Net   [███░░░░░░░░░░░░░░░░░]  17%',
        ],
        props: [
          { name: 'value', type: 'number', required: true },
          { name: 'max', type: 'number', default: '100' },
          { name: 'label', type: 'string' },
          { name: 'color', type: 'string' },
          { name: 'width', type: 'number', default: '30' },
        ],
        usage: `import { Gauge } from 'termui/components'

<Gauge value={72} max={100} label="CPU" color="yellow" />`,
      },
    ],
  },
  {
    name: 'Utility',
    components: [
      {
        name: 'Timer',
        description: 'Countdown timer with configurable duration and callbacks.',
        props: [
          { name: 'duration', type: 'number', required: true },
          { name: 'onComplete', type: '() => void' },
          { name: 'autoStart', type: 'boolean', default: 'true' },
          { name: 'format', type: 'string', default: "'mm:ss'" },
        ],
        usage: `import { Timer } from 'termui/components'

<Timer duration={60000} onComplete={() => console.log('Done!')} />`,
      },
      {
        name: 'Stopwatch',
        description: 'Elapsed time stopwatch with start/stop/reset.',
        props: [
          { name: 'autoStart', type: 'boolean', default: 'false' },
          { name: 'format', type: 'string', default: "'hh:mm:ss.ms'" },
        ],
        usage: `import { Stopwatch } from 'termui/components'

<Stopwatch autoStart />`,
      },
      {
        name: 'Clock',
        description: 'Live clock with configurable format.',
        props: [
          { name: 'format', type: 'string', default: "'HH:mm:ss'" },
          { name: 'timezone', type: 'string' },
          { name: 'color', type: 'string' },
        ],
        usage: `import { Clock } from 'termui/components'

<Clock format="HH:mm:ss" color="cyan" />`,
      },
      {
        name: 'Clipboard',
        description: 'OSC 52 clipboard write button.',
        props: [
          { name: 'value', type: 'string', required: true },
          { name: 'label', type: 'string', default: "'Copy'" },
          { name: 'onCopy', type: '() => void' },
        ],
        usage: `import { Clipboard } from 'termui/components'

<Clipboard value={apiKey} label="Copy API Key" />`,
      },
      {
        name: 'KeyboardShortcuts',
        description: 'Displays registered keyboard shortcuts in a formatted table.',
        props: [
          { name: 'shortcuts', type: 'Shortcut[]', required: true },
          { name: 'title', type: 'string' },
          { name: 'columns', type: 'number', default: '2' },
        ],
        usage: `import { KeyboardShortcuts } from 'termui/components'

<KeyboardShortcuts
  shortcuts={[
    { keys: ['Ctrl', 'S'], description: 'Save' },
    { keys: ['q'], description: 'Quit' },
  ]}
/>`,
      },
      {
        name: 'Help',
        description: 'Context-sensitive help panel with keyboard shortcuts.',
        props: [
          { name: 'isOpen', type: 'boolean', required: true },
          { name: 'onClose', type: '() => void', required: true },
          { name: 'shortcuts', type: 'Shortcut[]', required: true },
          { name: 'title', type: 'string', default: "'Keyboard Shortcuts'" },
        ],
        usage: `import { Help } from 'termui/components'

<Help isOpen={showHelp} onClose={() => setHelp(false)} shortcuts={shortcuts} />`,
      },
      {
        name: 'ErrorBoundary',
        description: 'Catches render errors and shows a formatted error screen.',
        props: [
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'fallback', type: 'ReactNode | ((error: Error) => ReactNode)' },
          { name: 'onError', type: '(error: Error) => void' },
        ],
        usage: `import { ErrorBoundary } from 'termui/components'

<ErrorBoundary fallback={<Text color="red">Something went wrong</Text>}>
  <MyApp />
</ErrorBoundary>`,
      },
      {
        name: 'Log',
        description: 'Scrollable log output with level-colored rows.',
        props: [
          { name: 'entries', type: 'LogEntry[]', required: true },
          { name: 'height', type: 'number', default: '10' },
          { name: 'follow', type: 'boolean', default: 'true' },
          { name: 'showTimestamp', type: 'boolean', default: 'true' },
        ],
        usage: `import { Log } from 'termui/components'

<Log entries={logLines} height={15} follow />`,
      },
      {
        name: 'Image',
        description: 'Renders images in terminals supporting Sixel or block characters.',
        props: [
          { name: 'src', type: 'string', required: true },
          { name: 'width', type: 'number' },
          { name: 'height', type: 'number' },
          { name: 'fallback', type: 'ReactNode' },
        ],
        usage: `import { Image } from 'termui/components'

<Image src="./logo.png" width={20} />`,
      },
      {
        name: 'QRCode',
        description: 'Renders a QR code using Unicode block characters.',
        preview: [
          '  ▛▀▀▀▀▀▜ ▄ ▛▀▀▀▀▀▜',
          '  ▌▛▀▀▜▌ █ ▌▛▀▀▜▌',
          '  ▌▙▄▄▟▌ ▀ ▌▙▄▄▟▌',
          '  ▙▄▄▄▄▄▟ █ ▙▄▄▄▄▄▟',
          '  ▀▀ █▄▄█ ▀ ▀▀ █▄▄',
          '  ▛▀▀▀▀▀▜ █ ▄█▀▀▄█',
          '  ▌▛▀▀▜▌ ▀ ▀▄▀▄▀▄',
          '',
          '  termui.dev',
        ],
        props: [
          { name: 'value', type: 'string', required: true },
          { name: 'size', type: 'number', default: '21' },
          { name: 'color', type: 'string', default: "'white'" },
        ],
        usage: `import { QRCode } from 'termui/components'

<QRCode value="https://termui.dev" />`,
      },
      {
        name: 'EmbeddedTerminal',
        description: 'Spawns a real PTY inside a TermUI Box (via termui/pty).',
        props: [
          { name: 'command', type: 'string', required: true },
          { name: 'args', type: 'string[]' },
          { name: 'width', type: 'number', default: '80' },
          { name: 'height', type: 'number', default: '20' },
          { name: 'onExit', type: '(code: number) => void' },
        ],
        usage: `import { EmbeddedTerminal } from 'termui/components'

<EmbeddedTerminal
  command="npm"
  args={['install']}
  width={80} height={20}
  onExit={(code) => console.log('Exit:', code)}
/>`,
      },
      {
        name: 'Profiler',
        description: 'React.Profiler wrapper that overlays live render timing stats.',
        props: [
          { name: 'id', type: 'string', required: true },
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'show', type: 'boolean', default: 'true' },
        ],
        usage: `import { Profiler } from 'termui/components'

<Profiler id="MyList" show>
  <MyList items={data} />
</Profiler>`,
      },
    ],
  },
  {
    name: 'Dev Tools',
    components: [
      {
        name: 'useRenderCount',
        description: 'Hook — returns the number of times the component has rendered.',
        props: [],
        usage: `import { useRenderCount } from '@termui/core'

function MyComponent() {
  const count = useRenderCount();
  return <Text>Renders: {count}</Text>;
}`,
      },
      {
        name: 'useRenderTime',
        description: 'Hook — tracks last render duration, total time, and render count.',
        props: [],
        usage: `import { useRenderTime } from '@termui/core'

function MyComponent() {
  const { lastRenderMs, peakMs, count } = useRenderTime();
  return <Text>{lastRenderMs.toFixed(1)}ms (peak {peakMs.toFixed(1)}ms, {count} renders)</Text>;
}`,
      },
      {
        name: 'renderToString',
        description: 'Testing util — renders a React element headlessly and returns plain text.',
        props: [],
        usage: `import { renderToString } from '@termui/testing'

const output = await renderToString(<Spinner style="dots" />);
expect(output).toContain('⠋');`,
      },
      {
        name: 'screen',
        description:
          'Testing util — query helpers (getByText, hasText, getLines) for plain-text output.',
        props: [],
        usage: `import { renderToString, screen } from '@termui/testing'

const out = await renderToString(<MyComponent />);
screen.getByText('Hello', out);          // throws if not found
expect(screen.hasText('Error', out)).toBe(false);`,
      },
      {
        name: 'fireEvent',
        description:
          'Testing util — simulate keyboard input (key, type, press) in component tests.',
        props: [],
        usage: `import { fireEvent } from '@termui/testing'

fireEvent.key('down');        // arrow down
fireEvent.key('enter');       // Enter
fireEvent.type('hello');      // type text
fireEvent.press(' ');         // space`,
      },
      {
        name: 'waitFor',
        description: 'Testing util — polls an assertion until it passes or timeout is reached.',
        props: [],
        usage: `import { waitFor } from '@termui/testing'

await waitFor(() => {
  expect(result.rerender().output).toContain('Done');
}, { timeout: 2000 });`,
      },
    ],
  },
  {
    name: 'Templates',
    components: [
      {
        name: 'SplashScreen',
        description:
          'Styled startup banner with big ASCII art title, subtitle, author credit with OSC 8 hyperlink, and optional status line.',
        props: [
          { name: 'title', type: 'string', required: true },
          { name: 'font', type: "'block' | 'simple'", required: false, default: "'block'" },
          { name: 'titleColor', type: 'string', required: false },
          { name: 'titleColorAlt', type: 'string', required: false },
          { name: 'subtitle', type: 'string', required: false },
          { name: 'subtitleDim', type: 'boolean', required: false, default: 'true' },
          { name: 'author', type: '{ name: string; href?: string }', required: false },
          { name: 'statusLine', type: 'ReactNode', required: false },
          { name: 'padding', type: 'number', required: false, default: '2' },
        ],
        usage: `import { SplashScreen } from '@termui/components'

<SplashScreen
  title="CC LENS"
  titleColor="#FFA500"
  titleColorAlt="#FFB84D"
  subtitle="Claude Code Lens  —  your ~/.claude/ at a glance"
  author={{ name: 'Arindam', href: 'https://github.com/Arindam200' }}
  statusLine={<Text>Starting server on <Text color="orange">http://localhost:3000</Text></Text>}
/>`,
      },
      {
        name: 'InfoBox',
        description:
          'Bordered info panel with header row (icon + label + version) and tree rows (└ key: value). Used in AppShell and WelcomeScreen.',
        props: [
          {
            name: 'borderStyle',
            type: "'single' | 'rounded' | 'double' | 'bold'",
            required: false,
            default: "'single'",
          },
          { name: 'borderColor', type: 'string', required: false },
          { name: 'padding', type: '[number, number]', required: false, default: '[0, 1]' },
          { name: 'width', type: "number | 'full'", required: false },
        ],
        usage: `import { InfoBox } from '@termui/components'

<InfoBox>
  <InfoBox.Header icon="●" label="OpenAI Codex" description="(research preview)" version="v0.1.25" versionColor="cyan" />
</InfoBox>

<InfoBox>
  <InfoBox.Row label="localhost" value="session:" valueDetail="5b703..." valueColor="magenta" />
  <InfoBox.TreeRow label="workdir" value="~/myproject" />
  <InfoBox.TreeRow label="model" value="gpt-4" bold />
</InfoBox>`,
      },
      {
        name: 'BulletList',
        description:
          'Nested structured content with ●/└/□ bullet prefixes. Used inside AppShell.Content.',
        props: [],
        usage: `import { BulletList } from '@termui/components'

<BulletList>
  <BulletList.Item label="Top-level item">
    <BulletList.Sub>
      <BulletList.TreeItem label="Sub-item with tree prefix" />
      <BulletList.CheckItem done={false} color="cyan" label="Pending task" />
      <BulletList.CheckItem done={true} label="Completed task" />
    </BulletList.Sub>
  </BulletList.Item>
</BulletList>`,
      },
      {
        name: 'AppShell',
        description:
          'Full-screen TUI layout: header info panel, scrollable content, full-width input bar, hints footer. Pairs with InfoBox and BulletList.',
        props: [{ name: 'fullscreen', type: 'boolean', required: false, default: 'true' }],
        usage: `import { AppShell, InfoBox, BulletList } from '@termui/components'

<AppShell>
  <AppShell.Header>
    <InfoBox>
      <InfoBox.Header icon=">_" label="MyApp" version="v0.0.0" />
      <InfoBox.TreeRow label="model" value="gpt-4" />
    </InfoBox>
  </AppShell.Header>
  <AppShell.Tip>Use /feedback to send logs.</AppShell.Tip>
  <AppShell.Input value={input} onChange={setInput} onSubmit={handleSubmit} placeholder="Ask anything..." />
  <AppShell.Content>
    <BulletList>
      <BulletList.Item label="Response content here" />
    </BulletList>
  </AppShell.Content>
  <AppShell.Hints items={['explain this codebase', 'fix any build errors']} />
</AppShell>`,
      },
      {
        name: 'WelcomeScreen',
        description:
          'Two-panel welcome dashboard with titled border (── AppName v1.0 ──), left panel (greeting + logo + meta), right panel (sections). Inspired by Claude Code startup.',
        props: [
          { name: 'appName', type: 'string', required: true },
          { name: 'appNameColor', type: 'string', required: false },
          { name: 'version', type: 'string', required: false },
          { name: 'borderColor', type: 'string', required: false },
          { name: 'leftWidth', type: 'number', required: false, default: '26' },
        ],
        usage: `import { WelcomeScreen } from '@termui/components'

<WelcomeScreen appName="Claude Code" version="v2.1.81" appNameColor="#CC7744" borderColor="#CC7744">
  <WelcomeScreen.Left>
    <WelcomeScreen.Greeting>Welcome back Arindam!</WelcomeScreen.Greeting>
    <WelcomeScreen.Logo>{'  ┌──┐  ┌┐  \\n  │██│  ││  \\n  └──┘──┘│  '}</WelcomeScreen.Logo>
    <WelcomeScreen.Meta items={['Sonnet 4.6', 'Claude Pro', '~/Developer']} separator=" · " dim />
  </WelcomeScreen.Left>
  <WelcomeScreen.Right>
    <WelcomeScreen.Section title="Tips" titleColor="#CC7744">
      Run /init to create a CLAUDE.md file.
    </WelcomeScreen.Section>
  </WelcomeScreen.Right>
</WelcomeScreen>`,
      },
      {
        name: 'LoginFlow',
        description:
          'Full-page onboarding/login screen with announcement banner, big ASCII title, description paragraphs, and numbered selection list with › cursor.',
        props: [
          { name: 'title', type: 'string', required: false },
          { name: 'titleColor', type: 'string', required: false },
          { name: 'padding', type: 'number', required: false, default: '2' },
          { name: 'onSelect', type: '(index: number) => void', required: false },
        ],
        usage: `import { LoginFlow } from '@termui/components'

<LoginFlow title="CLAUDE CODE" titleColor="#E8714A" onSelect={(i) => handleLogin(i)}>
  <LoginFlow.Announcement icon="*" iconColor="#E8714A">
    Welcome to <Text bold>Claude Code</Text> research preview!
  </LoginFlow.Announcement>
  <LoginFlow.Description bold>Claude Code can now be used with your Max subscription.</LoginFlow.Description>
  <LoginFlow.Description dim>Pricing may evolve as we move towards general availability.</LoginFlow.Description>
  <LoginFlow.Select
    label="Select login method:"
    options={['Anthropic Console (API usage billing)', 'Claude app (requires Max subscription)']}
    activeColor="cyan"
    onSelect={(i) => handleLogin(i)}
  />
</LoginFlow>`,
      },
      {
        name: 'UsageMonitor',
        description:
          'Real-time dashboard: ◆✦ header, ═══ separator, bracket tags, emoji metric rows with progress bars, burn rate, predictions, and sticky clock status bar.',
        props: [{ name: 'refreshInterval', type: 'number', required: false, default: '1000' }],
        usage: `import { UsageMonitor } from '@termui/components'

<UsageMonitor refreshInterval={1000}>
  <UsageMonitor.Header title="CLAUDE CODE USAGE MONITOR" titleColor="cyan" />
  <UsageMonitor.Tags items={['custom', 'europe/warsaw']} />
  <UsageMonitor.Section icon="🗂" title="Session-Based Dynamic Limits">
    <UsageMonitor.Metric icon="💰" label="Cost Usage:" value={44.49} max={164.32} percent={27.1} status="green" format="currency" />
    <UsageMonitor.Metric icon="⏰" label="Time to Reset:" value={141} max={240} percent={58.75} status="yellow" format="duration" showMax={false} />
  </UsageMonitor.Section>
  <UsageMonitor.Stats>
    <UsageMonitor.StatRow icon="🔥" label="Burn Rate:" value="2233.4 tokens/min" valueSuffix="⚡" />
  </UsageMonitor.Stats>
  <UsageMonitor.StatusBar clock sessionLabel="Active session" exitHint="Ctrl+C to exit" statusDot="green" />
</UsageMonitor>`,
      },
      {
        name: 'SetupFlow',
        description:
          '@clack/prompts-style sequential step flow with ◇/◆/│ visual language, colored pill badge, info steps, spinner, and multi-select.',
        props: [
          { name: 'title', type: 'string', required: false },
          { name: 'titleColor', type: 'string', required: false, default: "'#888888'" },
          { name: 'connectorChar', type: 'string', required: false, default: "'│'" },
        ],
        usage: `import { SetupFlow } from '@termui/components'

<SetupFlow title="SKILLS" titleColor="#888888">
  <SetupFlow.Badge label="skills" bg="cyan" color="black" />
  <SetupFlow.Step status="done">Source: https://github.com/nuxt/ui.git</SetupFlow.Step>
  <SetupFlow.Step status="done">Repository cloned</SetupFlow.Step>
  <SetupFlow.MultiSelect
    label="Select skills to install"
    hint="space to toggle"
    options={[
      { value: 'nuxt-ui', label: 'nuxt-ui', description: 'Build UIs with @nuxt/ui v4' },
      { value: 'contributing', label: 'contributing' },
    ]}
    onSubmit={(vals) => console.log(vals)}
  />
</SetupFlow>`,
      },
      {
        name: 'HelpScreen',
        description:
          'Static CLI help screen with big figlet banner, tagline, usage line, description, and aligned Options/Commands sections.',
        props: [
          { name: 'title', type: 'string', required: true },
          { name: 'titleColor', type: 'string', required: false },
          { name: 'tagline', type: 'string', required: false },
          { name: 'usage', type: 'string', required: false },
          { name: 'description', type: 'string', required: false },
          { name: 'flagWidth', type: 'number', required: false },
        ],
        usage: `import { HelpScreen } from '@termui/components'

<HelpScreen
  title="INSFORGE"
  titleColor="#ffffff"
  tagline="Welcome to InsForge CLI! Run \`insforge login\` to get started."
  usage="insforge [options] [command]"
  description="InsForge CLI — Command line tool for InsForge platform"
>
  <HelpScreen.Section label="Options:">
    <HelpScreen.Row flag="-V, --version" description="output the version number" />
    <HelpScreen.Row flag="-h, --help" description="display help for command" />
  </HelpScreen.Section>
  <HelpScreen.Section label="Commands:">
    <HelpScreen.Row flag="login [options]" description="Authenticate with InsForge platform" />
    <HelpScreen.Row flag="logout" description="Log out from InsForge platform" />
  </HelpScreen.Section>
</HelpScreen>`,
      },
    ],
  },
];

export function totalComponents(): number {
  return CATALOG.reduce((sum, cat) => sum + cat.components.length, 0);
}

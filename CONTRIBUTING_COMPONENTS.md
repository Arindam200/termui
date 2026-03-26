# Contributing Components to TermUI

The community registry lets anyone share components via `npx termui add @username/component`.

## Quick Start

1. **Create your component** following the [component structure](#structure)
2. **Run validation**: `npx termui publish ./my-component --dry-run`
3. **Submit**: Open a PR to [termui/community-registry](https://github.com/arindam200/termui)

## Component Structure

```
my-component/
├── MyComponent.tsx        # Main component source
├── MyComponent.test.tsx   # Tests (required)
├── docs.md                # Documentation (recommended)
└── meta.json              # Metadata
```

## meta.json Format

```json
{
  "name": "my-component",
  "description": "What your component does",
  "version": "0.1.0",
  "category": "feedback",
  "files": ["MyComponent.tsx"],
  "deps": [],
  "peerComponents": [],
  "registry": "community",
  "author": {
    "name": "Your Name",
    "github": "your-handle",
    "url": "https://yoursite.com"
  }
}
```

## Categories

`layout` | `typography` | `input` | `selection` | `data` | `feedback` | `navigation` | `overlays` | `forms` | `charts` | `utility` | `templates`

## Installation from community registry

Once accepted, users install via:

```bash
npx termui add @your-handle/my-component
```

## Review Criteria

- Renders correctly in a standard terminal (80×24)
- Has tests that pass
- Has a docs.md with props table and usage example
- Follows TypeScript strict mode
- Uses `useTheme()` for colors (no hardcoded hex values)

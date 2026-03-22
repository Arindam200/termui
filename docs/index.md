---
title: TermUI — Terminal UI Framework
---

# TermUI

> The missing terminal UI framework for TypeScript.
> Built with React/Ink. Distributed like shadcn. Designed for developers.

## Quick Start

```sh
# Initialize in your project
npx termui init

# Add components
npx termui add spinner progress-bar table

# Browse the gallery
npx termui preview
```

## Component Catalog

| Category                      | Components                                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [Layout](./layout.md)         | Box, Stack, Grid, ScrollView, Divider, Spacer, Columns, Center, AspectRatio                                                |
| [Typography](./typography.md) | Text, Heading, Code, Link, Badge, Tag, Markdown, JSON, Gradient, BigText, Digits                                           |
| [Input](./input.md)           | TextInput, TextArea, PasswordInput, NumberInput, SearchInput, MaskedInput, EmailInput, PathInput                           |
| [Selection](./selection.md)   | Select, MultiSelect, RadioGroup, Checkbox, CheckboxGroup, Toggle, TreeSelect, TagInput, ColorPicker                        |
| [Data Display](./data.md)     | Table, DataGrid, List, VirtualList, Tree, DirectoryTree, KeyValue, Definition, Card, Panel, GitStatus                      |
| [Feedback](./feedback.md)     | Spinner, ProgressBar, ProgressCircle, StatusMessage, Toast, Alert, Banner, Skeleton                                        |
| [Navigation](./navigation.md) | Tabs, TabbedContent, Breadcrumb, Pagination, CommandPalette, Menu, Sidebar                                                 |
| [Overlays](./overlays.md)     | Modal, Dialog, Drawer, Tooltip, Popover                                                                                    |
| [Forms](./forms.md)           | Form, FormField, Wizard, Confirm, DatePicker, TimePicker, FilePicker                                                       |
| [Charts](./charts.md)         | Sparkline, BarChart, LineChart, PieChart, HeatMap, Gauge                                                                   |
| [Utility](./utility.md)       | Timer, Stopwatch, Clock, Clipboard, KeyboardShortcuts, Help, ErrorBoundary, Log, Image, QRCode, EmbeddedTerminal, Profiler |

## API Reference

- [Core Hooks](./api/hooks.md)
- [CLI Commands](./api/cli.md)
- [@termui/testing](./api/testing.md)

## Theming

8 built-in themes: `default`, `dracula`, `nord`, `catppuccin`, `monokai`, `solarized`, `tokyo-night`, `one-dark`

```sh
npx termui theme dracula
```

## Distribution Model

TermUI uses a shadcn-style model: components are **copied into your project**, not installed as a black-box package. You own the source.

```sh
npx termui add spinner   # copies Spinner.tsx to components/ui/
```

## Registry

Components are served from GitHub Pages:
`https://arindam200.github.io/termui/components/<name>/`

With jsDelivr as automatic fallback:
`https://cdn.jsdelivr.net/gh/arindam200/termui@main/registry/components/<name>/`

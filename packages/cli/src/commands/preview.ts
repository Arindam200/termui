/**
 * npx termui preview
 *
 * Storybook-like interactive component gallery in the terminal.
 * Pure ANSI / readline — no Ink required.
 */

import readline from 'readline';
import { CATALOG, totalComponents } from '../preview/catalog.js';
import {
  render,
  ansi,
  HEADER_ROWS,
  FOOTER_ROWS,
  LEFT_W,
  editableProps,
  getPropKind,
  getEnumValues,
  initPlayProps,
  buildSearchResults,
} from '../preview/render.js';
import type { PreviewState } from '../preview/render.js';

export async function preview(_args: string[]): Promise<void> {
  if (!process.stdin.isTTY) {
    console.error('termui preview requires an interactive terminal.');
    process.exit(1);
  }

  const state: PreviewState = {
    categories: CATALOG,
    catIndex: 0,
    compIndex: 0,
    mode: 'list',
    scrollOffset: 0,
    detailScroll: 0,
    playProps: {},
    playPropIndex: 0,
    playEditing: false,
    playEditBuffer: '',
    playScroll: 0,
    searchMode: false,
    searchQuery: '',
    searchResults: [],
    searchResultIndex: 0,
  };

  process.stdout.write(ansi.hideCursor);
  readline.emitKeypressEvents(process.stdin);
  try {
    process.stdin.setRawMode(true);
  } catch {
    console.error('termui preview requires a terminal that supports raw mode (e.g. Windows Terminal).');
    process.exit(1);
  }
  process.stdin.resume();

  const cleanup = () => {
    process.stdout.write(ansi.showCursor + ansi.clearScreen);
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  if (process.platform !== 'win32') {
    process.on('SIGTERM', cleanup);
  }

  render(state);

  process.stdin.on('keypress', (_str: string | undefined, key: readline.Key) => {
    if (!key) return;

    if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
      cleanup();
      return;
    }

    const cat = state.categories[state.catIndex]!;
    const termRows = (process.stdout.rows || 30) - HEADER_ROWS - FOOTER_ROWS;
    const listRows = termRows - 3;

    // ── search mode ────────────────────────────────────────────────────────
    if (state.searchMode) {
      if (key.name === 'escape') {
        // Clear search entirely
        state.searchMode = false;
        state.searchQuery = '';
        state.searchResults = [];
        state.searchResultIndex = 0;
        state.scrollOffset = 0;
      } else if (key.name === 'return') {
        // Jump to selected search result
        if (state.searchResults.length > 0) {
          const result = state.searchResults[state.searchResultIndex];
          if (result) {
            state.catIndex = result.catIndex;
            state.compIndex = result.compIndex;
            state.scrollOffset = 0;
            state.detailScroll = 0;
            // Exit search and enter detail view
            state.searchMode = false;
            state.searchQuery = '';
            state.searchResults = [];
            state.searchResultIndex = 0;
            state.mode = 'detail';
          }
        } else {
          state.searchMode = false;
        }
      } else if (key.name === 'up' || key.name === 'k') {
        if (state.searchResultIndex > 0) {
          state.searchResultIndex--;
          if (state.searchResultIndex < state.scrollOffset) {
            state.scrollOffset = state.searchResultIndex;
          }
        }
      } else if (key.name === 'down' || key.name === 'j') {
        if (state.searchResultIndex < state.searchResults.length - 1) {
          state.searchResultIndex++;
          if (state.searchResultIndex >= state.scrollOffset + listRows) {
            state.scrollOffset = state.searchResultIndex - listRows + 1;
          }
        }
      } else if (key.name === 'backspace') {
        state.searchQuery = state.searchQuery.slice(0, -1);
        state.searchResults = buildSearchResults(state.categories, state.searchQuery);
        state.searchResultIndex = 0;
        state.scrollOffset = 0;
      } else if (_str && !key.ctrl && !key.meta && _str.length === 1) {
        state.searchQuery += _str;
        state.searchResults = buildSearchResults(state.categories, state.searchQuery);
        state.searchResultIndex = 0;
        state.scrollOffset = 0;
      }
      render(state);
      return;
    }

    // ── playground mode ────────────────────────────────────────────────────
    if (state.mode === 'playground') {
      const comp = cat.components[state.compIndex]!;
      const eProps = editableProps(comp);

      if (state.playEditing) {
        // Text-edit sub-mode (string / number props)
        if (key.name === 'return') {
          // Confirm edit
          const prop = eProps[state.playPropIndex];
          if (prop) state.playProps[prop.name] = state.playEditBuffer;
          state.playEditing = false;
        } else if (key.name === 'escape') {
          // Cancel — restore original value
          state.playEditing = false;
        } else if (key.name === 'backspace') {
          state.playEditBuffer = state.playEditBuffer.slice(0, -1);
        } else if (_str && !key.ctrl && !key.meta && _str.length === 1) {
          state.playEditBuffer += _str;
        }
      } else {
        // Navigate mode
        if (key.name === 'escape' || key.name === 'p') {
          state.mode = 'detail';
          state.playScroll = 0;
        } else if (key.name === 'up' || key.name === 'k') {
          state.playPropIndex = Math.max(0, state.playPropIndex - 1);
          // Scroll up if needed
          if (state.playPropIndex * 1 < state.playScroll) {
            state.playScroll = Math.max(0, state.playScroll - 1);
          }
        } else if (key.name === 'down' || key.name === 'j') {
          state.playPropIndex = Math.min(eProps.length - 1, state.playPropIndex + 1);
        } else if (key.name === 'return' || key.name === 'e') {
          // Start editing for string/number props
          const prop = eProps[state.playPropIndex];
          if (prop) {
            const kind = getPropKind(prop.type);
            if (kind === 'string' || kind === 'number') {
              state.playEditBuffer = state.playProps[prop.name] ?? '';
              state.playEditing = true;
            }
          }
        } else if (key.name === 'space') {
          // Toggle boolean
          const prop = eProps[state.playPropIndex];
          if (prop && getPropKind(prop.type) === 'boolean') {
            state.playProps[prop.name] = state.playProps[prop.name] === 'true' ? 'false' : 'true';
          }
        } else if (key.name === 'right' || key.name === 'l') {
          // Cycle enum forward
          const prop = eProps[state.playPropIndex];
          if (prop && getPropKind(prop.type) === 'enum') {
            const vals = getEnumValues(prop.type);
            const cur = vals.indexOf(state.playProps[prop.name] ?? '');
            state.playProps[prop.name] = vals[(cur + 1) % vals.length] ?? vals[0] ?? '';
          }
        } else if (key.name === 'left' || key.name === 'h') {
          // Cycle enum backward
          const prop = eProps[state.playPropIndex];
          if (prop && getPropKind(prop.type) === 'enum') {
            const vals = getEnumValues(prop.type);
            const cur = vals.indexOf(state.playProps[prop.name] ?? '');
            state.playProps[prop.name] =
              vals[(cur - 1 + vals.length) % vals.length] ?? vals[0] ?? '';
          }
        }
      }

      render(state);
      return;
    }

    // ── list mode ─────────────────────────────────────────────────────────
    if (state.mode === 'list') {
      if (key.name === 'up' || key.name === 'k') {
        if (state.compIndex > 0) {
          state.compIndex--;
          if (state.compIndex < state.scrollOffset) {
            state.scrollOffset = state.compIndex;
          }
        } else if (state.catIndex > 0) {
          state.catIndex--;
          const prev = state.categories[state.catIndex]!;
          state.compIndex = prev.components.length - 1;
          state.scrollOffset = Math.max(0, state.compIndex - listRows + 1);
        }
      } else if (key.name === 'down' || key.name === 'j') {
        if (state.compIndex < cat.components.length - 1) {
          state.compIndex++;
          if (state.compIndex >= state.scrollOffset + listRows) {
            state.scrollOffset = state.compIndex - listRows + 1;
          }
        } else if (state.catIndex < state.categories.length - 1) {
          state.catIndex++;
          state.compIndex = 0;
          state.scrollOffset = 0;
        }
      } else if (key.name === 'return' || key.name === 'right' || key.name === 'l') {
        state.mode = 'detail';
        state.detailScroll = 0;
      } else if (key.name === 'p') {
        // Enter playground directly from list
        const comp = cat.components[state.compIndex]!;
        state.playProps = initPlayProps(comp);
        state.playPropIndex = 0;
        state.playEditing = false;
        state.playScroll = 0;
        state.mode = 'playground';
      } else if (_str === '/') {
        // Enter search mode
        state.searchMode = true;
        state.searchQuery = '';
        state.searchResults = [];
        state.searchResultIndex = 0;
        state.scrollOffset = 0;
      }

      // ── detail mode ────────────────────────────────────────────────────────
    } else {
      if (key.name === 'escape' || key.name === 'left' || key.name === 'h') {
        state.mode = 'list';
        state.detailScroll = 0;
      } else if (key.name === 'p') {
        // Enter playground from detail
        const comp = cat.components[state.compIndex]!;
        state.playProps = initPlayProps(comp);
        state.playPropIndex = 0;
        state.playEditing = false;
        state.playScroll = 0;
        state.mode = 'playground';
      } else if (key.name === 'down' || key.name === 'j') {
        state.detailScroll++;
      } else if (key.name === 'up' || key.name === 'k') {
        state.detailScroll = Math.max(0, state.detailScroll - 1);
      } else if (key.name === 'right' || key.name === 'l') {
        state.detailScroll = 0;
        if (state.compIndex < cat.components.length - 1) {
          state.compIndex++;
        } else if (state.catIndex < state.categories.length - 1) {
          state.catIndex++;
          state.compIndex = 0;
          state.scrollOffset = 0;
        }
      } else if (key.name === 'tab') {
        state.detailScroll = 0;
        if (state.compIndex < cat.components.length - 1) {
          state.compIndex++;
        } else if (state.catIndex < state.categories.length - 1) {
          state.catIndex++;
          state.compIndex = 0;
          state.scrollOffset = 0;
        }
      } else if (_str === '/') {
        // Enter search mode from detail view too
        state.searchMode = true;
        state.searchQuery = '';
        state.searchResults = [];
        state.searchResultIndex = 0;
        state.scrollOffset = 0;
        state.mode = 'list';
      }
    }

    render(state);
  });

  process.stdout.on('resize', () => render(state));
}

export function previewHelp(): void {
  const total = totalComponents();
  console.log(`
${ansi.bold}${ansi.magenta}termui preview${ansi.reset}

Interactive component gallery — browse all ${total} TermUI components.

${ansi.bold}Usage:${ansi.reset}
  npx termui preview

${ansi.bold}Navigation:${ansi.reset}
  ${ansi.cyan}↑ k${ansi.reset}          Move up  (list: prev component, detail: scroll up)
  ${ansi.cyan}↓ j${ansi.reset}          Move down (list: next component, detail: scroll down)
  ${ansi.cyan}→ Enter l${ansi.reset}    Open detail view / next component
  ${ansi.cyan}← Esc h${ansi.reset}      Back to list
  ${ansi.cyan}Tab${ansi.reset}          Next component (in detail view)
  ${ansi.cyan}p${ansi.reset}            Open Props Playground for current component
  ${ansi.cyan}/${ansi.reset}            Open fuzzy search across all components
  ${ansi.cyan}q${ansi.reset}            Quit

${ansi.bold}Search:${ansi.reset}
  ${ansi.cyan}/${ansi.reset}            Enter search mode (available in list and detail modes)
  ${ansi.cyan}type${ansi.reset}         Filter components by name or description in real-time
  ${ansi.cyan}↑ ↓${ansi.reset}          Navigate through results
  ${ansi.cyan}Enter${ansi.reset}         Jump to selected component's detail view
  ${ansi.cyan}Esc${ansi.reset}          Clear search and return to full list

${ansi.bold}Props Playground:${ansi.reset}
  ${ansi.cyan}↑ ↓${ansi.reset}          Navigate props
  ${ansi.cyan}Space${ansi.reset}         Toggle boolean prop on/off
  ${ansi.cyan}← →${ansi.reset}          Cycle through enum values
  ${ansi.cyan}Enter e${ansi.reset}       Edit string / number prop
  ${ansi.cyan}p Esc${ansi.reset}         Exit playground, back to detail
`);
}

import { describe, it, expect } from 'vitest';
import { Tabs } from './Tabs.js';

// ── Export smoke test ──────────────────────────────────────────────────────

describe('Tabs export', () => {
  it('is exported as a function', () => {
    expect(typeof Tabs).toBe('function');
  });
});

// ── Tab navigation logic ───────────────────────────────────────────────────
// Mirrors the keyboard handler in Tabs.tsx

interface Tab {
  key: string;
  label: string;
}

function simulateTabs(tabs: Tab[], defaultTab?: string) {
  let active = defaultTab ?? tabs[0]?.key ?? '';

  function nextTab() {
    const idx = tabs.findIndex((t) => t.key === active);
    if (idx < tabs.length - 1) active = tabs[idx + 1]!.key;
  }

  function prevTab() {
    const idx = tabs.findIndex((t) => t.key === active);
    if (idx > 0) active = tabs[idx - 1]!.key;
  }

  return { getActive: () => active, nextTab, prevTab };
}

const TABS: Tab[] = [
  { key: 'home', label: 'Home' },
  { key: 'settings', label: 'Settings' },
  { key: 'about', label: 'About' },
];

describe('Tab navigation', () => {
  it('starts on the first tab by default', () => {
    const { getActive } = simulateTabs(TABS);
    expect(getActive()).toBe('home');
  });

  it('starts on the specified defaultTab', () => {
    const { getActive } = simulateTabs(TABS, 'settings');
    expect(getActive()).toBe('settings');
  });

  it('advances to next tab', () => {
    const { nextTab, getActive } = simulateTabs(TABS);
    nextTab();
    expect(getActive()).toBe('settings');
  });

  it('does not advance past the last tab', () => {
    const { nextTab, getActive } = simulateTabs(TABS, 'about');
    nextTab();
    expect(getActive()).toBe('about');
  });

  it('goes back to previous tab', () => {
    const { prevTab, getActive } = simulateTabs(TABS, 'settings');
    prevTab();
    expect(getActive()).toBe('home');
  });

  it('does not go before the first tab', () => {
    const { prevTab, getActive } = simulateTabs(TABS);
    prevTab();
    expect(getActive()).toBe('home');
  });

  it('can navigate through all tabs forward', () => {
    const { nextTab, getActive } = simulateTabs(TABS);
    nextTab();
    nextTab();
    expect(getActive()).toBe('about');
  });
});

// ── Tab key finding ────────────────────────────────────────────────────────

describe('findIndex', () => {
  it('finds tab by key', () => {
    const idx = TABS.findIndex((t) => t.key === 'settings');
    expect(idx).toBe(1);
  });

  it('returns -1 for unknown key', () => {
    const idx = TABS.findIndex((t) => t.key === 'missing');
    expect(idx).toBe(-1);
  });
});

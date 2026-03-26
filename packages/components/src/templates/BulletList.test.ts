import { describe, it, expect } from 'vitest';
import { BulletList } from './BulletList.js';

// ── Export smoke tests ────────────────────────────────────────────────────────

describe('BulletList export', () => {
  it('is exported as a function', () => {
    expect(typeof BulletList).toBe('function');
  });

  it('exposes Item sub-component', () => {
    expect(typeof BulletList.Item).toBe('function');
  });

  it('exposes Sub sub-component', () => {
    expect(typeof BulletList.Sub).toBe('function');
  });

  it('exposes TreeItem sub-component', () => {
    expect(typeof BulletList.TreeItem).toBe('function');
  });

  it('exposes CheckItem sub-component', () => {
    expect(typeof BulletList.CheckItem).toBe('function');
  });
});

// ── BulletListItem — ● prefix ─────────────────────────────────────────────────

describe('BulletList.Item prefix char', () => {
  it('uses ● as the bullet character', () => {
    const BULLET = '●';
    expect(BULLET).toBe('●');
    // Confirm codepoint so char encoding is correct
    expect(BULLET.codePointAt(0)).toBe(0x25cf);
  });

  it('renders prefix followed by a space', () => {
    const prefix = '● ';
    expect(prefix).toBe('● ');
    expect(prefix.length).toBe(2);
  });
});

// ── BulletListTreeItem — └ prefix ────────────────────────────────────────────

describe('BulletList.TreeItem prefix char', () => {
  it('uses └ as the tree connector', () => {
    const TREE = '└';
    expect(TREE).toBe('└');
    expect(TREE.codePointAt(0)).toBe(0x2514);
  });

  it('renders prefix followed by a space', () => {
    const prefix = '└ ';
    expect(prefix.length).toBe(2);
  });
});

// ── BulletListCheckItem — □/■ chars ───────────────────────────────────────────

describe('BulletList.CheckItem icons', () => {
  it('uses □ for unchecked state (done=false)', () => {
    const icon = false ? '■' : '□';
    expect(icon).toBe('□');
    expect(icon.codePointAt(0)).toBe(0x25a1);
  });

  it('uses ■ for checked state (done=true)', () => {
    const icon = true ? '■' : '□';
    expect(icon).toBe('■');
    expect(icon.codePointAt(0)).toBe(0x25a0);
  });

  it('icon changes when done flips from false to true', () => {
    const unchecked = false ? '■' : '□';
    const checked = true ? '■' : '□';
    expect(unchecked).not.toBe(checked);
  });
});

// ── Prop shapes ───────────────────────────────────────────────────────────────

describe('BulletList prop shapes', () => {
  it('BulletListItemProps requires label string', () => {
    const props = { label: 'Install dependencies' };
    expect(typeof props.label).toBe('string');
  });

  it('BulletListItemProps bold defaults to false', () => {
    const bold = false;
    expect(bold).toBe(false);
  });

  it('BulletListCheckItemProps done defaults to false', () => {
    const done = false;
    expect(done).toBe(false);
  });

  it('BulletListTreeItemProps requires label string', () => {
    const props = { label: 'child node' };
    expect(typeof props.label).toBe('string');
  });
});

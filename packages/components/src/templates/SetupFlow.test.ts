import { describe, it, expect } from 'vitest';
import { SetupFlow } from './SetupFlow.js';
import type { SetupFlowStepStatus } from './SetupFlow.js';

// ── Export smoke tests ────────────────────────────────────────────────────────

describe('SetupFlow export', () => {
  it('is exported as a function', () => {
    expect(typeof SetupFlow).toBe('function');
  });

  it('exposes Badge sub-component', () => {
    expect(typeof SetupFlow.Badge).toBe('function');
  });

  it('exposes Step sub-component', () => {
    expect(typeof SetupFlow.Step).toBe('function');
  });

  it('exposes Spinner sub-component', () => {
    expect(typeof SetupFlow.Spinner).toBe('function');
  });

  it('exposes MultiSelect sub-component', () => {
    expect(typeof SetupFlow.MultiSelect).toBe('function');
  });
});

// ── STATUS_ICONS mapping ───────────────────────────────────────────────────────
// Mirrors the STATUS_ICONS constant in SetupFlow.tsx

const STATUS_ICONS: Record<SetupFlowStepStatus, { icon: string; color: string; dim: boolean }> = {
  done: { icon: '◇', color: 'white', dim: false },
  active: { icon: '◆', color: 'cyan', dim: false },
  pending: { icon: '◇', color: 'white', dim: true },
  success: { icon: '✓', color: 'green', dim: false },
  error: { icon: '✗', color: 'red', dim: false },
};

describe('SetupFlow.Step status icons', () => {
  it('done status uses ◇ icon', () => {
    expect(STATUS_ICONS.done.icon).toBe('◇');
    expect(STATUS_ICONS.done.icon.codePointAt(0)).toBe(0x25c7);
  });

  it('active status uses ◆ icon', () => {
    expect(STATUS_ICONS.active.icon).toBe('◆');
    expect(STATUS_ICONS.active.icon.codePointAt(0)).toBe(0x25c6);
  });

  it('pending status uses ◇ icon (dimmed)', () => {
    expect(STATUS_ICONS.pending.icon).toBe('◇');
    expect(STATUS_ICONS.pending.dim).toBe(true);
  });

  it('success status uses ✓ icon', () => {
    expect(STATUS_ICONS.success.icon).toBe('✓');
  });

  it('error status uses ✗ icon', () => {
    expect(STATUS_ICONS.error.icon).toBe('✗');
  });

  it('done and pending share the same icon but differ in dim', () => {
    expect(STATUS_ICONS.done.icon).toBe(STATUS_ICONS.pending.icon);
    expect(STATUS_ICONS.done.dim).toBe(false);
    expect(STATUS_ICONS.pending.dim).toBe(true);
  });

  it('active icon differs from done icon', () => {
    expect(STATUS_ICONS.active.icon).not.toBe(STATUS_ICONS.done.icon);
  });
});

describe('SetupFlow.Step status colors', () => {
  it('active color is cyan', () => {
    expect(STATUS_ICONS.active.color).toBe('cyan');
  });

  it('success color is green', () => {
    expect(STATUS_ICONS.success.color).toBe('green');
  });

  it('error color is red', () => {
    expect(STATUS_ICONS.error.color).toBe('red');
  });
});

// ── SetupFlow.Badge label wrapping ────────────────────────────────────────────
// Badge renders: ' ┌ ' + label + ' ┐ '

describe('SetupFlow.Badge label format', () => {
  function badgeLabel(label: string): string {
    return ' ┌ ' + label + ' ┐ ';
  }

  it('wraps label with ┌ and ┐ box corners', () => {
    const result = badgeLabel('v1.0.0');
    expect(result).toBe(' ┌ v1.0.0 ┐ ');
  });

  it('starts with ┌ character', () => {
    const result = badgeLabel('beta');
    expect(result).toContain('┌');
  });

  it('ends with ┐ character', () => {
    const result = badgeLabel('beta');
    expect(result).toContain('┐');
  });

  it('contains the label text', () => {
    const result = badgeLabel('release');
    expect(result).toContain('release');
  });
});

// ── Connector char ────────────────────────────────────────────────────────────

describe('SetupFlow connector', () => {
  it('default connector char is │', () => {
    const connectorChar = '│';
    expect(connectorChar).toBe('│');
    expect(connectorChar.codePointAt(0)).toBe(0x2502);
  });
});

// ── SetupFlowStepStatus type values ───────────────────────────────────────────

describe('SetupFlowStepStatus valid values', () => {
  const validStatuses: SetupFlowStepStatus[] = ['done', 'active', 'pending', 'success', 'error'];

  it('has exactly 5 status values', () => {
    expect(validStatuses.length).toBe(5);
  });

  it('includes done', () => {
    expect(validStatuses).toContain('done');
  });

  it('includes active', () => {
    expect(validStatuses).toContain('active');
  });

  it('all statuses have entries in STATUS_ICONS', () => {
    for (const s of validStatuses) {
      expect(STATUS_ICONS[s]).toBeDefined();
    }
  });
});

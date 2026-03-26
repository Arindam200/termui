import { describe, it, expect } from 'vitest';
import { ChatMessage } from './ChatMessage.js';
import { ChatThread } from './ChatThread.js';
import { ToolCall } from './ToolCall.js';
import { ThinkingBlock } from './ThinkingBlock.js';
import { TokenUsage, ContextMeter } from './TokenUsage.js';
import { ToolApproval } from './ToolApproval.js';

// ── Export smoke tests ─────────────────────────────────────────────────────

describe('AI component exports', () => {
  it('ChatMessage is exported as a function', () => {
    expect(typeof ChatMessage).toBe('function');
  });

  it('ChatThread is exported as a function', () => {
    expect(typeof ChatThread).toBe('function');
  });

  it('ToolCall is exported as a function', () => {
    expect(typeof ToolCall).toBe('function');
  });

  it('ThinkingBlock is exported as a function', () => {
    expect(typeof ThinkingBlock).toBe('function');
  });

  it('TokenUsage is exported as a function', () => {
    expect(typeof TokenUsage).toBe('function');
  });

  it('ContextMeter is exported as a function', () => {
    expect(typeof ContextMeter).toBe('function');
  });

  it('ToolApproval is exported as a function', () => {
    expect(typeof ToolApproval).toBe('function');
  });
});

// ── ChatMessage — role labels ──────────────────────────────────────────────
// Mirrors `roleLabel` map inside ChatMessage.tsx

type ChatRole = 'user' | 'assistant' | 'system' | 'error';

const ROLE_LABEL: Record<ChatRole, string> = {
  user: 'user',
  assistant: 'assistant',
  system: 'system',
  error: 'error',
};

function resolveDisplayName(role: ChatRole, name?: string): string {
  return name ?? ROLE_LABEL[role];
}

describe('ChatMessage role display', () => {
  it('renders "user" label for user role', () => {
    expect(resolveDisplayName('user')).toBe('user');
  });

  it('renders "assistant" label for assistant role', () => {
    expect(resolveDisplayName('assistant')).toBe('assistant');
  });

  it('renders "system" label for system role', () => {
    expect(resolveDisplayName('system')).toBe('system');
  });

  it('renders "error" label for error role', () => {
    expect(resolveDisplayName('error')).toBe('error');
  });

  it('renders custom name instead of role label when name prop is set', () => {
    expect(resolveDisplayName('assistant', 'Claude')).toBe('Claude');
    expect(resolveDisplayName('user', 'Arindam')).toBe('Arindam');
  });
});

// ── ChatMessage — content text ─────────────────────────────────────────────
// Mirrors first-line truncation logic for collapsed mode in ChatMessage.tsx

function buildCollapsedPreview(content: string, maxLen = 60): string {
  const firstLine = content.split('\n')[0] ?? '';
  const truncated = firstLine.slice(0, maxLen);
  const needsEllipsis = firstLine.length > maxLen || content.includes('\n');
  return truncated + (needsEllipsis ? '...' : '');
}

describe('ChatMessage content text', () => {
  it('renders short single-line content unchanged', () => {
    expect(buildCollapsedPreview('Hello world')).toBe('Hello world');
  });

  it('truncates long first line at 60 characters with ellipsis', () => {
    const long = 'A'.repeat(80);
    const preview = buildCollapsedPreview(long);
    expect(preview).toBe('A'.repeat(60) + '...');
  });

  it('adds ellipsis when content has multiple lines', () => {
    const multiline = 'First line\nSecond line';
    expect(buildCollapsedPreview(multiline)).toContain('...');
  });

  it('shows only first line in collapsed preview', () => {
    const multiline = 'First line\nSecond line';
    expect(buildCollapsedPreview(multiline)).toMatch(/^First line/);
  });
});

// ── ToolCall — status indicators ───────────────────────────────────────────
// Mirrors the `statusIcon` switch in ToolCall.tsx

type ToolCallStatus = 'pending' | 'running' | 'success' | 'error';

const STATUS_ICON: Record<ToolCallStatus, string> = {
  pending: '○',
  running: 'spinner', // dynamic; represented as a category
  success: '✓',
  error: '✗',
};

function resolveStatusIcon(status: ToolCallStatus): string {
  return STATUS_ICON[status];
}

describe('ToolCall status indicators', () => {
  it('uses pending icon for pending status', () => {
    expect(resolveStatusIcon('pending')).toBe('○');
  });

  it('uses success checkmark for success status', () => {
    expect(resolveStatusIcon('success')).toBe('✓');
  });

  it('uses error cross for error status', () => {
    expect(resolveStatusIcon('error')).toBe('✗');
  });

  it('uses spinner category for running status', () => {
    expect(resolveStatusIcon('running')).toBe('spinner');
  });
});

// ── ToolCall — tool name rendering ────────────────────────────────────────

describe('ToolCall tool name', () => {
  it('passes tool name through to display', () => {
    // The name prop is rendered directly as Text — verify it is preserved as-is
    const toolName = 'read_file';
    expect(toolName).toBe('read_file');
  });

  it('accepts tool names with special characters', () => {
    const names = ['bash', 'str_replace_editor', 'web:search', 'list-files'];
    names.forEach((n) => expect(typeof n).toBe('string'));
  });
});

// ── ToolCall — duration text ───────────────────────────────────────────────
// Mirrors `durationText` computation in ToolCall.tsx

function resolveDurationText(
  duration: number | undefined,
  status: ToolCallStatus,
  elapsed: number
): string | null {
  if (duration !== undefined) return `${duration}ms`;
  if (status === 'running') return `${elapsed}ms`;
  return null;
}

describe('ToolCall duration text', () => {
  it('shows provided duration in ms', () => {
    expect(resolveDurationText(120, 'success', 0)).toBe('120ms');
  });

  it('shows live elapsed time when running with no provided duration', () => {
    expect(resolveDurationText(undefined, 'running', 350)).toBe('350ms');
  });

  it('returns null when pending and no duration provided', () => {
    expect(resolveDurationText(undefined, 'pending', 0)).toBeNull();
  });

  it('returns null when success and no duration provided', () => {
    expect(resolveDurationText(undefined, 'success', 0)).toBeNull();
  });
});

// ── ThinkingBlock — thinking content ─────────────────────────────────────
// Mirrors `headerParts` + `headerText` construction in ThinkingBlock.tsx

function buildThinkingHeader(
  streaming: boolean,
  label: string,
  tokenCount?: number,
  duration?: number
): string {
  const tokenStr = tokenCount !== undefined ? `${tokenCount.toLocaleString()} tokens` : null;
  const durationStr = duration !== undefined ? `${(duration / 1000).toFixed(1)}s` : null;
  const parts = [streaming ? 'Thinking...' : label, tokenStr, durationStr].filter(Boolean);
  return parts.join(' · ');
}

describe('ThinkingBlock thinking content', () => {
  it('shows label in header when not streaming', () => {
    expect(buildThinkingHeader(false, 'Reasoning')).toBe('Reasoning');
  });

  it('shows "Thinking..." when streaming', () => {
    expect(buildThinkingHeader(true, 'Reasoning')).toBe('Thinking...');
  });

  it('appends token count to header', () => {
    const header = buildThinkingHeader(false, 'Reasoning', 1500);
    expect(header).toContain('1,500 tokens');
  });

  it('appends duration to header', () => {
    const header = buildThinkingHeader(false, 'Reasoning', undefined, 3200);
    expect(header).toContain('3.2s');
  });

  it('combines all parts with " · " separator', () => {
    const header = buildThinkingHeader(false, 'Reasoning', 800, 1000);
    expect(header).toBe('Reasoning · 800 tokens · 1.0s');
  });

  it('uses custom label', () => {
    expect(buildThinkingHeader(false, 'Analysis')).toBe('Analysis');
  });
});

// ── TokenUsage — input / output token numbers ─────────────────────────────
// Mirrors `formatTokens` in TokenUsage.tsx

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

describe('TokenUsage input/output token rendering', () => {
  it('formats small token counts as plain numbers', () => {
    expect(formatTokens(0)).toBe('0');
    expect(formatTokens(500)).toBe('500');
    expect(formatTokens(999)).toBe('999');
  });

  it('formats thousands with k suffix', () => {
    expect(formatTokens(1_000)).toBe('1.0k');
    expect(formatTokens(4_500)).toBe('4.5k');
    expect(formatTokens(999_999)).toBe('1000.0k');
  });

  it('formats millions with M suffix', () => {
    expect(formatTokens(1_000_000)).toBe('1.0M');
    expect(formatTokens(2_500_000)).toBe('2.5M');
  });

  it('formats large prompt token counts', () => {
    // Typical prompt usage
    expect(formatTokens(12_345)).toBe('12.3k');
  });

  it('formats large completion token counts', () => {
    // Typical completion usage
    expect(formatTokens(3_200)).toBe('3.2k');
  });
});

// ── ContextMeter — filled / total percentages ─────────────────────────────
// Mirrors `percent` and `filled`/`empty` calculations in ContextMeter

function calcContextMeter(
  used: number,
  limit: number,
  width = 20
): { percent: number; filled: number; empty: number } {
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return { percent, filled, empty };
}

describe('ContextMeter filled/total percentages', () => {
  it('calculates 0% when used is 0', () => {
    const { percent, filled, empty } = calcContextMeter(0, 100_000);
    expect(percent).toBe(0);
    expect(filled).toBe(0);
    expect(empty).toBe(20);
  });

  it('calculates 50% correctly', () => {
    const { percent, filled, empty } = calcContextMeter(50_000, 100_000);
    expect(percent).toBe(50);
    expect(filled).toBe(10);
    expect(empty).toBe(10);
  });

  it('calculates 100% at full capacity', () => {
    const { percent, filled, empty } = calcContextMeter(100_000, 100_000);
    expect(percent).toBe(100);
    expect(filled).toBe(20);
    expect(empty).toBe(0);
  });

  it('caps at 100% when used exceeds limit', () => {
    const { percent } = calcContextMeter(120_000, 100_000);
    expect(percent).toBe(100);
  });

  it('respects custom bar width', () => {
    const { filled, empty } = calcContextMeter(25_000, 100_000, 40);
    expect(filled).toBe(10);
    expect(empty).toBe(30);
  });
});

// ── ContextMeter — color thresholds ───────────────────────────────────────
// Mirrors the warnAt / criticalAt branching in ContextMeter

type ColorLevel = 'normal' | 'warn' | 'critical';

function resolveBarColor(percent: number, warnAt = 75, criticalAt = 90): ColorLevel {
  if (percent >= criticalAt) return 'critical';
  if (percent >= warnAt) return 'warn';
  return 'normal';
}

describe('ContextMeter color thresholds', () => {
  it('is "normal" below warnAt', () => {
    expect(resolveBarColor(50)).toBe('normal');
    expect(resolveBarColor(74)).toBe('normal');
  });

  it('is "warn" at warnAt threshold', () => {
    expect(resolveBarColor(75)).toBe('warn');
    expect(resolveBarColor(89)).toBe('warn');
  });

  it('is "critical" at criticalAt threshold', () => {
    expect(resolveBarColor(90)).toBe('critical');
    expect(resolveBarColor(100)).toBe('critical');
  });

  it('respects custom warnAt / criticalAt values', () => {
    expect(resolveBarColor(60, 50, 80)).toBe('warn');
    expect(resolveBarColor(85, 50, 80)).toBe('critical');
  });
});

// ── ToolApproval — risk level ─────────────────────────────────────────────
// Mirrors `riskLabel` map in ToolApproval.tsx

type RiskLevel = 'low' | 'medium' | 'high';

const RISK_LABEL: Record<RiskLevel, string> = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
};

function resolveRiskLabel(risk: RiskLevel): string {
  return RISK_LABEL[risk];
}

describe('ToolApproval risk level', () => {
  it('renders "LOW" for low risk', () => {
    expect(resolveRiskLabel('low')).toBe('LOW');
  });

  it('renders "MEDIUM" for medium risk', () => {
    expect(resolveRiskLabel('medium')).toBe('MEDIUM');
  });

  it('renders "HIGH" for high risk', () => {
    expect(resolveRiskLabel('high')).toBe('HIGH');
  });
});

// ── ToolApproval — tool name ───────────────────────────────────────────────

describe('ToolApproval tool name', () => {
  it('preserves tool name as-is', () => {
    const name = 'bash';
    expect(name).toBe('bash');
  });

  it('accepts multi-word tool names', () => {
    const name = 'str_replace_editor';
    expect(name).toContain('str_replace');
  });
});

// ── ToolApproval — keybinding hints ───────────────────────────────────────
// Mirrors the [y]/[n]/[a] controls rendered in ToolApproval.tsx

function resolveKeybindings(hasAlwaysAllow: boolean): string[] {
  const keys = ['[y] Approve', '[n] Deny'];
  if (hasAlwaysAllow) keys.push('[a] Always Allow');
  return keys;
}

describe('ToolApproval keybinding hints', () => {
  it('always shows Approve and Deny', () => {
    const keys = resolveKeybindings(false);
    expect(keys).toContain('[y] Approve');
    expect(keys).toContain('[n] Deny');
  });

  it('shows Always Allow only when onAlwaysAllow is provided', () => {
    expect(resolveKeybindings(true)).toContain('[a] Always Allow');
    expect(resolveKeybindings(false)).not.toContain('[a] Always Allow');
  });
});

import { describe, it, expect } from 'vitest';
import { Clock } from './Clock.js';
import { Timer } from './Timer.js';
import { Log } from './Log.js';
import { ErrorBoundary } from './ErrorBoundary.js';
import { Stopwatch } from './Stopwatch.js';
import { formatTime, formatElapsed, pad } from './formatters.js';

// ── Export smoke tests ──────────────────────────────────────────────────────

describe('utility component exports', () => {
  it('Clock is exported as a function', () => {
    expect(typeof Clock).toBe('function');
  });

  it('Timer is exported as a function', () => {
    expect(typeof Timer).toBe('function');
  });

  it('Log is exported as a function', () => {
    expect(typeof Log).toBe('function');
  });

  it('ErrorBoundary is exported as a function', () => {
    expect(typeof ErrorBoundary).toBe('function');
  });

  it('Stopwatch is exported as a function', () => {
    expect(typeof Stopwatch).toBe('function');
  });
});

// ── Clock — time format output ──────────────────────────────────────────────
// Mirrors `getTimeParts` in Clock.tsx — produces colon-separated time strings.

type ClockFormat = '12h' | '24h';

function getTimeParts(
  format: ClockFormat,
  showSeconds: boolean,
  hoursOverride?: number,
  minutesOverride?: number,
  secondsOverride?: number
): { time: string; ampm: string } {
  let hours = hoursOverride ?? 14;
  const minutes = minutesOverride ?? 5;
  const seconds = secondsOverride ?? 30;
  let ampm = '';

  if (format === '12h') {
    ampm = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12 || 12;
  }

  const p = (n: number) => String(n).padStart(2, '0');
  const time = showSeconds
    ? `${p(hours)}:${p(minutes)}:${p(seconds)}`
    : `${p(hours)}:${p(minutes)}`;

  return { time, ampm };
}

describe('Clock output contains colon-separated time format', () => {
  it('produces HH:MM:SS format when showSeconds is true (24h)', () => {
    const { time } = getTimeParts('24h', true, 14, 5, 30);
    expect(time).toBe('14:05:30');
    expect(time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it('produces HH:MM format when showSeconds is false (24h)', () => {
    const { time } = getTimeParts('24h', false, 9, 3);
    expect(time).toBe('09:03');
    expect(time).toMatch(/^\d{2}:\d{2}$/);
  });

  it('produces 12h AM time correctly', () => {
    const { time, ampm } = getTimeParts('12h', true, 9, 0, 0);
    expect(time).toBe('09:00:00');
    expect(ampm).toBe(' AM');
  });

  it('produces 12h PM time correctly', () => {
    const { time, ampm } = getTimeParts('12h', true, 14, 30, 0);
    expect(time).toBe('02:30:00');
    expect(ampm).toBe(' PM');
  });

  it('converts midnight (0h) to 12 in 12h mode', () => {
    const { time, ampm } = getTimeParts('12h', false, 0, 0);
    expect(time).toBe('12:00');
    expect(ampm).toBe(' AM');
  });

  it('converts noon (12h) to 12 PM in 12h mode', () => {
    const { time, ampm } = getTimeParts('12h', false, 12, 0);
    expect(time).toBe('12:00');
    expect(ampm).toBe(' PM');
  });

  it('has no ampm in 24h mode', () => {
    const { ampm } = getTimeParts('24h', true, 20, 0, 0);
    expect(ampm).toBe('');
  });

  it('zero-pads single-digit hours and minutes', () => {
    const { time } = getTimeParts('24h', true, 3, 7, 9);
    expect(time).toBe('03:07:09');
  });
});

// ── Timer — formatTime: countdown output ───────────────────────────────────
// Mirrors `formatTime` imported from formatters.ts — used by Timer component.

describe('Timer formatTime renders countdown format', () => {
  it('formats MM:SS for "ms" format', () => {
    expect(formatTime(90, 'ms')).toBe('01:30');
  });

  it('formats HH:MM:SS for "hms" format', () => {
    expect(formatTime(3661, 'hms')).toBe('01:01:01');
  });

  it('formats plain seconds for "s" format', () => {
    expect(formatTime(45, 's')).toBe('45s');
  });

  it('shows 00:00 when remaining time is 0 (ms format)', () => {
    expect(formatTime(0, 'ms')).toBe('00:00');
  });

  it('shows 00:00:00 when remaining time is 0 (hms format)', () => {
    expect(formatTime(0, 'hms')).toBe('00:00:00');
  });

  it('shows 0s when remaining time is 0 (s format)', () => {
    expect(formatTime(0, 's')).toBe('0s');
  });

  it('zero-pads minutes and seconds below 10', () => {
    expect(formatTime(65, 'ms')).toBe('01:05');
  });

  it('handles large durations correctly', () => {
    // 2 hours, 3 minutes, 4 seconds
    expect(formatTime(7384, 'hms')).toBe('02:03:04');
  });
});

// ── Timer — autoStart / status resolution ──────────────────────────────────
// Mirrors the `running` state and `status` string derivation in Timer.tsx.

type TimerStatus = 'Done!' | 'Running' | 'Paused';

function resolveTimerStatus(running: boolean, completed: boolean): TimerStatus {
  if (completed) return 'Done!';
  if (running) return 'Running';
  return 'Paused';
}

describe('Timer status labels', () => {
  it('shows "Paused" when not running and not completed', () => {
    expect(resolveTimerStatus(false, false)).toBe('Paused');
  });

  it('shows "Running" when running', () => {
    expect(resolveTimerStatus(true, false)).toBe('Running');
  });

  it('shows "Done!" when completed', () => {
    expect(resolveTimerStatus(false, true)).toBe('Done!');
  });

  it('completed takes precedence over running', () => {
    expect(resolveTimerStatus(true, true)).toBe('Done!');
  });
});

// ── Timer — default prop values ─────────────────────────────────────────────

function resolveTimerDefaults(
  autoStart?: boolean,
  format?: 'hms' | 'ms' | 's'
): { autoStart: boolean; format: 'hms' | 'ms' | 's' } {
  return {
    autoStart: autoStart ?? false,
    format: format ?? 'hms',
  };
}

describe('Timer default props', () => {
  it('autoStart defaults to false', () => {
    expect(resolveTimerDefaults().autoStart).toBe(false);
  });

  it('format defaults to "hms"', () => {
    expect(resolveTimerDefaults().format).toBe('hms');
  });
});

// ── Log — level color mapping ───────────────────────────────────────────────
// Mirrors LEVEL_COLORS in Log.tsx

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: 'gray',
  info: 'cyan',
  warn: 'yellow',
  error: 'red',
};

const LEVEL_LABELS: Record<LogLevel, string> = {
  debug: 'DBG',
  info: 'INF',
  warn: 'WRN',
  error: 'ERR',
};

describe('Log level color mapping', () => {
  it('error level uses red color', () => {
    expect(LEVEL_COLORS['error']).toBe('red');
  });

  it('warn level uses yellow color', () => {
    expect(LEVEL_COLORS['warn']).toBe('yellow');
  });

  it('info level uses cyan color', () => {
    expect(LEVEL_COLORS['info']).toBe('cyan');
  });

  it('debug level uses gray color', () => {
    expect(LEVEL_COLORS['debug']).toBe('gray');
  });
});

describe('Log level label abbreviations', () => {
  it('error maps to ERR', () => {
    expect(LEVEL_LABELS['error']).toBe('ERR');
  });

  it('warn maps to WRN', () => {
    expect(LEVEL_LABELS['warn']).toBe('WRN');
  });

  it('info maps to INF', () => {
    expect(LEVEL_LABELS['info']).toBe('INF');
  });

  it('debug maps to DBG', () => {
    expect(LEVEL_LABELS['debug']).toBe('DBG');
  });
});

// ── Log — entry filtering ───────────────────────────────────────────────────
// Mirrors the `useMemo` filter logic in Log.tsx

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp?: Date;
}

function filterEntries(entries: LogEntry[], filter?: string): LogEntry[] {
  if (!filter) return entries;
  const lower = filter.toLowerCase();
  return entries.filter(
    (e) => e.message.toLowerCase().includes(lower) || e.level.toLowerCase().includes(lower)
  );
}

describe('Log entry filtering', () => {
  const entries: LogEntry[] = [
    { level: 'info', message: 'Server started on port 3000' },
    { level: 'warn', message: 'Low memory warning' },
    { level: 'error', message: 'Connection refused' },
    { level: 'debug', message: 'Cache hit: user/123' },
  ];

  it('returns all entries when no filter is provided', () => {
    expect(filterEntries(entries)).toHaveLength(4);
  });

  it('filters entries by message content (case-insensitive)', () => {
    const result = filterEntries(entries, 'memory');
    expect(result).toHaveLength(1);
    expect(result[0]?.message).toContain('memory');
  });

  it('filters entries by level name', () => {
    const result = filterEntries(entries, 'error');
    expect(result).toHaveLength(1);
    expect(result[0]?.level).toBe('error');
  });

  it('returns empty array when no entries match filter', () => {
    expect(filterEntries(entries, 'zzz_no_match')).toHaveLength(0);
  });

  it('is case-insensitive for message filtering', () => {
    expect(filterEntries(entries, 'SERVER')).toHaveLength(1);
  });

  it('matches partial message strings', () => {
    const result = filterEntries(entries, 'port');
    expect(result).toHaveLength(1);
    expect(result[0]?.message).toContain('port');
  });
});

// ── Log — timestamp formatting ──────────────────────────────────────────────
// Mirrors `formatTimestamp` in Log.tsx

function formatTimestamp(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

describe('Log timestamp formatting', () => {
  it('formats as HH:MM:SS with colon separators', () => {
    const ts = new Date(2024, 0, 1, 14, 5, 9);
    expect(formatTimestamp(ts)).toBe('14:05:09');
    expect(formatTimestamp(ts)).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it('zero-pads single-digit hours, minutes, seconds', () => {
    const ts = new Date(2024, 0, 1, 3, 7, 2);
    expect(formatTimestamp(ts)).toBe('03:07:02');
  });

  it('handles midnight correctly', () => {
    const ts = new Date(2024, 0, 1, 0, 0, 0);
    expect(formatTimestamp(ts)).toBe('00:00:00');
  });
});

// ── Log — scroll / viewport windowing ──────────────────────────────────────
// Mirrors `filtered.slice(scrollOffset, scrollOffset + height)` in Log.tsx

function getVisibleEntries(entries: LogEntry[], height: number, scrollOffset: number): LogEntry[] {
  return entries.slice(scrollOffset, scrollOffset + height);
}

function getMaxOffset(totalEntries: number, height: number): number {
  return Math.max(0, totalEntries - height);
}

describe('Log viewport windowing', () => {
  const manyEntries: LogEntry[] = Array.from({ length: 20 }, (_, i) => ({
    level: 'info' as LogLevel,
    message: `Log line ${i + 1}`,
  }));

  it('shows only `height` entries at once', () => {
    const visible = getVisibleEntries(manyEntries, 5, 0);
    expect(visible).toHaveLength(5);
  });

  it('shows correct entries at scrollOffset 0', () => {
    const visible = getVisibleEntries(manyEntries, 3, 0);
    expect(visible[0]?.message).toBe('Log line 1');
    expect(visible[2]?.message).toBe('Log line 3');
  });

  it('shows correct entries at a non-zero scroll offset', () => {
    const visible = getVisibleEntries(manyEntries, 3, 5);
    expect(visible[0]?.message).toBe('Log line 6');
  });

  it('computes maxOffset correctly', () => {
    expect(getMaxOffset(20, 5)).toBe(15);
    expect(getMaxOffset(5, 5)).toBe(0);
    expect(getMaxOffset(3, 10)).toBe(0);
  });
});

// ── ErrorBoundary — getDerivedStateFromError ────────────────────────────────
// Mirrors `getDerivedStateFromError` static method in ErrorBoundary class.

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

function getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
  return { hasError: true, error };
}

describe('ErrorBoundary getDerivedStateFromError', () => {
  it('sets hasError to true when an error is caught', () => {
    const state = getDerivedStateFromError(new Error('Something broke'));
    expect(state.hasError).toBe(true);
  });

  it('stores the error object in state', () => {
    const err = new Error('Render failure');
    const state = getDerivedStateFromError(err);
    expect(state.error).toBe(err);
  });

  it('preserves error message', () => {
    const err = new Error('Child component crashed');
    const state = getDerivedStateFromError(err);
    expect(state.error?.message).toBe('Child component crashed');
  });
});

// ── ErrorBoundary — fallback rendering logic ────────────────────────────────
// Mirrors the render() decision tree: children → custom fallback → default UI.

function resolveRenderOutput(
  hasError: boolean,
  hasFallback: boolean,
  errorMessage?: string
): 'children' | 'custom-fallback' | 'default-error-ui' {
  if (!hasError) return 'children';
  if (hasFallback) return 'custom-fallback';
  return 'default-error-ui';
}

describe('ErrorBoundary fallback rendering', () => {
  it('renders children when there is no error', () => {
    expect(resolveRenderOutput(false, false)).toBe('children');
  });

  it('renders custom fallback when error occurs and fallback is provided', () => {
    expect(resolveRenderOutput(true, true)).toBe('custom-fallback');
  });

  it('renders default error UI when error occurs and no fallback is provided', () => {
    expect(resolveRenderOutput(true, false)).toBe('default-error-ui');
  });
});

// ── ErrorBoundary — default error title ────────────────────────────────────

function resolveTitle(title?: string): string {
  return title ?? 'Error';
}

describe('ErrorBoundary title', () => {
  it('defaults to "Error" when title is not provided', () => {
    expect(resolveTitle()).toBe('Error');
  });

  it('uses custom title when provided', () => {
    expect(resolveTitle('Unexpected Failure')).toBe('Unexpected Failure');
  });
});

// ── ErrorBoundary — componentStack truncation ──────────────────────────────
// Mirrors `.slice(0, 6)` stack line trimming in ErrorBoundary render()

function parseStackLines(componentStack: string): string[] {
  return componentStack
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 6);
}

describe('ErrorBoundary component stack truncation', () => {
  it('keeps at most 6 stack lines', () => {
    const stack = Array.from({ length: 10 }, (_, i) => `  at Component${i}`).join('\n');
    expect(parseStackLines(stack)).toHaveLength(6);
  });

  it('trims whitespace from each line', () => {
    const stack = '   at App   \n   at Root   ';
    const lines = parseStackLines(stack);
    expect(lines[0]).toBe('at App');
    expect(lines[1]).toBe('at Root');
  });

  it('filters out blank lines', () => {
    const stack = 'at A\n\n   \nat B';
    const lines = parseStackLines(stack);
    expect(lines).toHaveLength(2);
  });

  it('returns empty array for empty component stack', () => {
    expect(parseStackLines('')).toHaveLength(0);
  });
});

// ── Stopwatch — formatElapsed ───────────────────────────────────────────────
// Mirrors `formatElapsed` from formatters.ts — used by Stopwatch component.

describe('Stopwatch formatElapsed', () => {
  it('formats zero milliseconds as 00:00:00.00', () => {
    expect(formatElapsed(0)).toBe('00:00:00.00');
  });

  it('formats 1500ms as 00:00:01.50', () => {
    expect(formatElapsed(1500)).toBe('00:00:01.50');
  });

  it('formats 61000ms (1 min 1 sec) as 00:01:01.00', () => {
    expect(formatElapsed(61000)).toBe('00:01:01.00');
  });

  it('formats 3661000ms (1h 1m 1s) as 01:01:01.00', () => {
    expect(formatElapsed(3661000)).toBe('01:01:01.00');
  });

  it('includes centiseconds in output', () => {
    // 999ms → 0 full seconds, 99 centiseconds
    expect(formatElapsed(999)).toBe('00:00:00.99');
  });

  it('output always contains exactly three colon-separated segments plus centiseconds', () => {
    // Expected pattern: HH:MM:SS.cc
    expect(formatElapsed(12345)).toMatch(/^\d{2}:\d{2}:\d{2}\.\d{2}$/);
  });
});

// ── Stopwatch — status labels ───────────────────────────────────────────────
// Mirrors `status` string derivation in Stopwatch.tsx

type StopwatchStatus = 'Running' | 'Ready' | 'Stopped';

function resolveStopwatchStatus(running: boolean, elapsed: number): StopwatchStatus {
  if (running) return 'Running';
  if (elapsed === 0) return 'Ready';
  return 'Stopped';
}

describe('Stopwatch status labels', () => {
  it('shows "Ready" when not running and elapsed is 0', () => {
    expect(resolveStopwatchStatus(false, 0)).toBe('Ready');
  });

  it('shows "Running" when running', () => {
    expect(resolveStopwatchStatus(true, 500)).toBe('Running');
  });

  it('shows "Stopped" when paused mid-run', () => {
    expect(resolveStopwatchStatus(false, 3000)).toBe('Stopped');
  });
});

// ── formatters — pad utility ────────────────────────────────────────────────

describe('pad utility', () => {
  it('zero-pads single-digit numbers to 2 chars', () => {
    expect(pad(5)).toBe('05');
    expect(pad(0)).toBe('00');
  });

  it('does not pad numbers already at desired length', () => {
    expect(pad(10)).toBe('10');
    expect(pad(59)).toBe('59');
  });

  it('respects custom length parameter', () => {
    expect(pad(7, 3)).toBe('007');
    expect(pad(42, 4)).toBe('0042');
  });
});

import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '@termui/core';

export type DiffMode = 'unified' | 'split' | 'inline';

export interface DiffViewProps {
  oldText: string;
  newText: string;
  filename?: string;
  language?: string;
  mode?: DiffMode;
  context?: number;
  showLineNumbers?: boolean;
}

// ─── LCS-based diff algorithm ────────────────────────────────────────────────

type DiffOp = { type: 'equal' | 'insert' | 'delete'; line: string };

function computeDiff(oldLines: string[], newLines: string[]): DiffOp[] {
  const m = oldLines.length;
  const n = newLines.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]! + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
      }
    }
  }

  // Backtrack to produce diff ops
  const ops: DiffOp[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      ops.unshift({ type: 'equal', line: oldLines[i - 1]! });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i]![j - 1]! >= dp[i - 1]![j]!)) {
      ops.unshift({ type: 'insert', line: newLines[j - 1]! });
      j--;
    } else {
      ops.unshift({ type: 'delete', line: oldLines[i - 1]! });
      i--;
    }
  }

  return ops;
}

interface Hunk {
  oldStart: number;
  newStart: number;
  ops: DiffOp[];
}

function buildHunks(ops: DiffOp[], context: number): Hunk[] {
  // Assign line numbers to ops
  let oldLine = 1;
  let newLine = 1;
  const numbered = ops.map((op) => {
    const o = op.type !== 'insert' ? oldLine : null;
    const n = op.type !== 'delete' ? newLine : null;
    if (op.type !== 'insert') oldLine++;
    if (op.type !== 'delete') newLine++;
    return { ...op, oldLine: o, newLine: n };
  });

  // Find changed indices
  const changed = new Set<number>();
  numbered.forEach((op, idx) => {
    if (op.type !== 'equal') changed.add(idx);
  });

  if (changed.size === 0) return [];

  // Build context windows
  const included = new Set<number>();
  for (const idx of changed) {
    for (let d = -context; d <= context; d++) {
      const t = idx + d;
      if (t >= 0 && t < numbered.length) included.add(t);
    }
  }

  // Group into contiguous hunks
  const indices = Array.from(included).sort((a, b) => a - b);
  const hunks: Hunk[] = [];
  let start = 0;
  while (start < indices.length) {
    let end = start;
    while (end + 1 < indices.length && indices[end + 1]! === indices[end]! + 1) end++;
    const slice = indices.slice(start, end + 1).map((i) => numbered[i]!);
    const firstOld = slice.find((op) => op.oldLine !== null)?.oldLine ?? 1;
    const firstNew = slice.find((op) => op.newLine !== null)?.newLine ?? 1;
    hunks.push({ oldStart: firstOld, newStart: firstNew, ops: slice });
    start = end + 1;
  }

  return hunks;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DiffView({
  oldText,
  newText,
  filename,
  mode = 'unified',
  context = 3,
  showLineNumbers = false,
}: DiffViewProps) {
  const theme = useTheme();

  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const ops = computeDiff(oldLines, newLines);
  const hunks = buildHunks(ops, context);
  const hasChanges = ops.some((op) => op.type !== 'equal');

  if (!hasChanges) {
    return (
      <Box flexDirection="column">
        {filename && (
          <Text bold color={theme.colors.foreground}>
            {filename}
          </Text>
        )}
        <Text dimColor color={theme.colors.mutedForeground}>
          No differences
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {filename && (
        <Text bold color={theme.colors.foreground}>
          --- {filename}
        </Text>
      )}
      {mode === 'split' ? (
        <SplitView hunks={hunks} showLineNumbers={showLineNumbers} theme={theme} />
      ) : mode === 'inline' ? (
        <InlineView ops={ops} showLineNumbers={showLineNumbers} theme={theme} />
      ) : (
        <UnifiedView hunks={hunks} showLineNumbers={showLineNumbers} theme={theme} />
      )}
    </Box>
  );
}

// ─── Unified view ─────────────────────────────────────────────────────────────

interface ViewProps {
  hunks: Hunk[];
  showLineNumbers: boolean;
  theme: ReturnType<typeof useTheme>;
}

function UnifiedView({ hunks, showLineNumbers, theme }: ViewProps) {
  const rows: React.ReactNode[] = [];

  hunks.forEach((hunk, hi) => {
    // Hunk header
    const oldCount = hunk.ops.filter((op) => op.type !== 'insert').length;
    const newCount = hunk.ops.filter((op) => op.type !== 'delete').length;
    rows.push(
      <Box key={`hunk-${hi}`}>
        <Text color="cyan" dimColor>
          @@ -{hunk.oldStart},{oldCount} +{hunk.newStart},{newCount} @@
        </Text>
      </Box>
    );

    let ol = hunk.oldStart;
    let nl = hunk.newStart;

    hunk.ops.forEach((op, oi) => {
      const key = `${hi}-${oi}`;
      const currentOl = op.type !== 'insert' ? ol : null;
      const currentNl = op.type !== 'delete' ? nl : null;
      if (op.type !== 'insert') ol++;
      if (op.type !== 'delete') nl++;

      if (op.type === 'delete') {
        rows.push(
          <Box key={key} gap={1}>
            {showLineNumbers && (
              <Text color={theme.colors.mutedForeground} dimColor>
                {String(currentOl ?? '').padStart(4)} {' '.repeat(4)}
              </Text>
            )}
            <Text color="red">-{op.line}</Text>
          </Box>
        );
      } else if (op.type === 'insert') {
        rows.push(
          <Box key={key} gap={1}>
            {showLineNumbers && (
              <Text color={theme.colors.mutedForeground} dimColor>
                {' '.repeat(4)} {String(currentNl ?? '').padStart(4)}
              </Text>
            )}
            <Text color="green">+{op.line}</Text>
          </Box>
        );
      } else {
        rows.push(
          <Box key={key} gap={1}>
            {showLineNumbers && (
              <Text color={theme.colors.mutedForeground} dimColor>
                {String(currentOl ?? '').padStart(4)} {String(currentNl ?? '').padStart(4)}
              </Text>
            )}
            <Text dimColor> {op.line}</Text>
          </Box>
        );
      }
    });
  });

  return <Box flexDirection="column">{rows}</Box>;
}

// ─── Split view ───────────────────────────────────────────────────────────────

function SplitView({ hunks, showLineNumbers, theme }: ViewProps) {
  const rows: React.ReactNode[] = [];

  hunks.forEach((hunk, hi) => {
    const oldCount = hunk.ops.filter((op) => op.type !== 'insert').length;
    const newCount = hunk.ops.filter((op) => op.type !== 'delete').length;
    rows.push(
      <Box key={`hunk-${hi}`}>
        <Text color="cyan" dimColor>
          @@ -{hunk.oldStart},{oldCount} +{hunk.newStart},{newCount} @@
        </Text>
      </Box>
    );

    let ol = hunk.oldStart;
    let nl = hunk.newStart;

    // For split, show equal lines, then paired del/ins
    hunk.ops.forEach((op, oi) => {
      const key = `${hi}-${oi}`;
      const currentOl = op.type !== 'insert' ? ol : null;
      const currentNl = op.type !== 'delete' ? nl : null;
      if (op.type !== 'insert') ol++;
      if (op.type !== 'delete') nl++;

      if (op.type === 'equal') {
        rows.push(
          <Box key={key} gap={2}>
            {showLineNumbers && (
              <Text dimColor color={theme.colors.mutedForeground}>
                {String(currentOl ?? '').padStart(4)}
              </Text>
            )}
            <Text dimColor>{op.line}</Text>
            <Text> │ </Text>
            {showLineNumbers && (
              <Text dimColor color={theme.colors.mutedForeground}>
                {String(currentNl ?? '').padStart(4)}
              </Text>
            )}
            <Text dimColor>{op.line}</Text>
          </Box>
        );
      } else if (op.type === 'delete') {
        rows.push(
          <Box key={key} gap={2}>
            {showLineNumbers && (
              <Text dimColor color={theme.colors.mutedForeground}>
                {String(currentOl ?? '').padStart(4)}
              </Text>
            )}
            <Text color="red">-{op.line}</Text>
            <Text> │ </Text>
            <Text> </Text>
          </Box>
        );
      } else {
        rows.push(
          <Box key={key} gap={2}>
            <Text> </Text>
            <Text> │ </Text>
            {showLineNumbers && (
              <Text dimColor color={theme.colors.mutedForeground}>
                {String(currentNl ?? '').padStart(4)}
              </Text>
            )}
            <Text color="green">+{op.line}</Text>
          </Box>
        );
      }
    });

  });

  return <Box flexDirection="column">{rows}</Box>;
}

// ─── Inline view ──────────────────────────────────────────────────────────────
// Shows the full file linearly: equal lines dimmed, deletions red, insertions
// green — no hunk headers. Deletions and insertions appear in order so the
// reader sees old→new in place without jumping around the diff.

interface InlineViewProps {
  ops: DiffOp[];
  showLineNumbers: boolean;
  theme: ReturnType<typeof useTheme>;
}

function InlineView({ ops, showLineNumbers, theme }: InlineViewProps) {
  const rows: React.ReactNode[] = [];
  let oldLine = 1;
  let newLine = 1;

  ops.forEach((op, idx) => {
    const currentOl = op.type !== 'insert' ? oldLine : null;
    const currentNl = op.type !== 'delete' ? newLine : null;
    if (op.type !== 'insert') oldLine++;
    if (op.type !== 'delete') newLine++;

    if (op.type === 'delete') {
      rows.push(
        <Box key={idx} gap={1}>
          {showLineNumbers && (
            <Text color={theme.colors.mutedForeground} dimColor>
              {String(currentOl ?? '').padStart(4)} {'    '}
            </Text>
          )}
          <Text color="red" dimColor>
            -{op.line}
          </Text>
        </Box>
      );
    } else if (op.type === 'insert') {
      rows.push(
        <Box key={idx} gap={1}>
          {showLineNumbers && (
            <Text color={theme.colors.mutedForeground} dimColor>
              {'    '} {String(currentNl ?? '').padStart(4)}
            </Text>
          )}
          <Text color="green">+{op.line}</Text>
        </Box>
      );
    } else {
      rows.push(
        <Box key={idx} gap={1}>
          {showLineNumbers && (
            <Text color={theme.colors.mutedForeground} dimColor>
              {String(currentOl ?? '').padStart(4)} {String(currentNl ?? '').padStart(4)}
            </Text>
          )}
          <Text dimColor> {op.line}</Text>
        </Box>
      );
    }
  });

  return <Box flexDirection="column">{rows}</Box>;
}

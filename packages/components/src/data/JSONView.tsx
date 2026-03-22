import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useInput, useTheme } from '@termui/core';

export interface JSONViewProps {
  data: unknown;
  /** Initial indent spaces. Default: 2 */
  indent?: number;
  /** Whether nodes start collapsed. Default: false */
  collapsed?: boolean;
  label?: string;
}

interface JSONLine {
  path: string;
  depth: number;
  key?: string;
  value?: unknown;
  type: 'open' | 'close' | 'primitive';
  openChar?: string;
  closeChar?: string;
  isLast: boolean;
  collapsible: boolean;
}

function buildLines(
  data: unknown,
  depth: number,
  key: string | undefined,
  isLast: boolean,
  pathPrefix: string
): JSONLine[] {
  const path = pathPrefix + (key !== undefined ? `.${key}` : '');

  if (Array.isArray(data)) {
    const lines: JSONLine[] = [];
    lines.push({
      path,
      depth,
      key,
      type: 'open',
      openChar: '[',
      closeChar: ']',
      isLast,
      collapsible: true,
    });
    data.forEach((item, idx) => {
      const childLines = buildLines(item, depth + 1, undefined, idx === data.length - 1, path);
      lines.push(...childLines);
    });
    lines.push({
      path: path + '_close',
      depth,
      type: 'close',
      closeChar: ']',
      isLast,
      collapsible: false,
    });
    return lines;
  }

  if (data !== null && typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>);
    const lines: JSONLine[] = [];
    lines.push({
      path,
      depth,
      key,
      type: 'open',
      openChar: '{',
      closeChar: '}',
      isLast,
      collapsible: true,
    });
    entries.forEach(([k, v], idx) => {
      const childLines = buildLines(v, depth + 1, k, idx === entries.length - 1, path);
      lines.push(...childLines);
    });
    lines.push({
      path: path + '_close',
      depth,
      type: 'close',
      closeChar: '}',
      isLast,
      collapsible: false,
    });
    return lines;
  }

  return [
    {
      path,
      depth,
      key,
      value: data,
      type: 'primitive',
      isLast,
      collapsible: false,
    },
  ];
}

export function JSONView({ data, indent = 2, collapsed = false, label }: JSONViewProps) {
  const theme = useTheme();
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());
  const [cursor, setCursor] = useState(0);

  const lines = buildLines(data, 0, undefined, true, 'root');

  // Filter out lines that are inside collapsed paths
  const visibleLines: JSONLine[] = [];
  const collapsedOpenPaths = new Set<string>();

  for (const line of lines) {
    // Check if any ancestor path is collapsed
    const isHidden = [...collapsedOpenPaths].some(
      (cp) =>
        line.path.startsWith(cp + '.') ||
        (line.path.startsWith(cp + '_close') && line.path !== cp + '_close')
    );

    // For close lines, check if its own open path is collapsed (to still show close bracket)
    if (line.type === 'close') {
      const openPath = line.path.replace('_close', '');
      if (collapsedOpenPaths.has(openPath)) {
        // Skip close line when collapsed (we show ... instead)
        continue;
      }
    }

    if (!isHidden) {
      visibleLines.push(line);
    }

    if (
      line.type === 'open' &&
      (collapsedPaths.has(line.path) ||
        (collapsed && collapsedPaths.size === 0 && line.depth === 0))
    ) {
      collapsedOpenPaths.add(line.path);
    }
  }

  useInput((input, key) => {
    if (key.upArrow) {
      setCursor((c) => Math.max(0, c - 1));
    } else if (key.downArrow) {
      setCursor((c) => Math.min(visibleLines.length - 1, c + 1));
    } else if (input === ' ') {
      const line = visibleLines[cursor];
      if (line && line.collapsible) {
        setCollapsedPaths((prev) => {
          const next = new Set(prev);
          if (next.has(line.path)) {
            next.delete(line.path);
          } else {
            next.add(line.path);
          }
          return next;
        });
      }
    }
  });

  function renderValue(value: unknown): React.ReactNode {
    if (value === null) {
      return <Text color={theme.colors.mutedForeground}>null</Text>;
    }
    if (typeof value === 'string') {
      return <Text color={theme.colors.success}>&quot;{value}&quot;</Text>;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return <Text color={theme.colors.warning}>{String(value)}</Text>;
    }
    return <Text color={theme.colors.foreground}>{String(value)}</Text>;
  }

  return (
    <Box flexDirection="column">
      {label && (
        <Text bold color={theme.colors.primary}>
          {label}
        </Text>
      )}
      {visibleLines.map((line, idx) => {
        const isCursor = idx === cursor;
        const spaces = ' '.repeat(line.depth * indent);

        if (line.type === 'open') {
          const isCollapsed =
            collapsedPaths.has(line.path) ||
            (collapsed && collapsedPaths.size === 0 && line.depth === 0);
          return (
            <Box key={line.path + idx}>
              <Text backgroundColor={isCursor ? theme.colors.selection : undefined}>
                <Text>{spaces}</Text>
                {line.key !== undefined && (
                  <>
                    <Text color={theme.colors.primary}>&quot;{line.key}&quot;</Text>
                    <Text color={theme.colors.foreground}>: </Text>
                  </>
                )}
                <Text color={theme.colors.foreground}>{line.openChar}</Text>
                {isCollapsed && (
                  <>
                    <Text color={theme.colors.mutedForeground}> ... </Text>
                    <Text color={theme.colors.foreground}>{line.closeChar}</Text>
                    {!line.isLast && <Text color={theme.colors.foreground}>,</Text>}
                  </>
                )}
              </Text>
            </Box>
          );
        }

        if (line.type === 'close') {
          return (
            <Box key={line.path + idx}>
              <Text backgroundColor={isCursor ? theme.colors.selection : undefined}>
                <Text>{spaces}</Text>
                <Text color={theme.colors.foreground}>{line.closeChar}</Text>
                {!line.isLast && <Text color={theme.colors.foreground}>,</Text>}
              </Text>
            </Box>
          );
        }

        // primitive
        return (
          <Box key={line.path + idx}>
            <Text backgroundColor={isCursor ? theme.colors.selection : undefined}>
              <Text>{spaces}</Text>
              {line.key !== undefined && (
                <>
                  <Text color={theme.colors.primary}>&quot;{line.key}&quot;</Text>
                  <Text color={theme.colors.foreground}>: </Text>
                </>
              )}
              {renderValue(line.value)}
              {!line.isLast && <Text color={theme.colors.foreground}>,</Text>}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}

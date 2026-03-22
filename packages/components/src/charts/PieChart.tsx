import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '@termui/core';

export interface PieChartItem {
  label: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieChartItem[];
  radius?: number;
  showLegend?: boolean;
  showPercentages?: boolean;
}

// Default palette for items without explicit colors
const DEFAULT_COLORS = [
  '#7c3aed', // violet
  '#2563eb', // blue
  '#16a34a', // green
  '#d97706', // amber
  '#dc2626', // red
  '#0891b2', // cyan
  '#be185d', // pink
  '#65a30d', // lime
];

// Block chars for pie slices
const FULL_BLOCK = '█';
const HALF_BLOCK = '▌';
const LEGEND_SQUARE = '■';

/**
 * Approximate a pie chart using a 2D character grid.
 * Each cell is tested to see which segment it belongs to,
 * then rendered with that segment's color using block chars.
 */
function buildPieGrid(
  data: PieChartItem[],
  radius: number
): Array<Array<{ char: string; color: string }>> {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return [];

  // Terminal cells are ~2x taller than wide, so scale x by 2
  const cols = radius * 4;
  const rows = radius * 2;
  const cx = cols / 2;
  const cy = rows / 2;

  const grid: Array<Array<{ char: string; color: string }>> = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ char: ' ', color: '' }))
  );

  // Pre-compute cumulative angles for each segment
  let angles: Array<{ start: number; end: number; color: string }> = [];
  let cumulative = 0;
  for (const item of data) {
    const slice = (item.value / total) * Math.PI * 2;
    angles.push({ start: cumulative, end: cumulative + slice, color: item.color ?? '' });
    cumulative += slice;
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const dx = (col - cx) / 2; // account for terminal aspect ratio
      const dy = row - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > radius) continue;

      let angle = Math.atan2(dy, dx) + Math.PI / 2; // 0 at top
      if (angle < 0) angle += Math.PI * 2;

      // Find which segment this angle belongs to
      const seg =
        angles.find((a) => angle >= a.start && angle < a.end) ?? angles[angles.length - 1];
      if (seg) {
        grid[row]![col] = { char: FULL_BLOCK, color: seg.color };
      }
    }
  }

  return grid;
}

export function PieChart({
  data,
  radius = 5,
  showLegend = true,
  showPercentages = true,
}: PieChartProps) {
  const theme = useTheme();

  if (data.length === 0) {
    return <Text color={theme.colors.mutedForeground}>No data</Text>;
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  // Assign colors
  const itemsWithColors = data.map((item, idx) => ({
    ...item,
    color: item.color ?? DEFAULT_COLORS[idx % DEFAULT_COLORS.length] ?? theme.colors.primary,
  }));

  const grid = buildPieGrid(itemsWithColors, radius);

  return (
    <Box flexDirection="row" gap={2}>
      {/* Pie grid */}
      <Box flexDirection="column">
        {grid.map((row, rowIdx) => (
          <Box key={rowIdx} flexDirection="row">
            {row.map((cell, colIdx) =>
              cell.char === ' ' ? (
                <Text key={colIdx}> </Text>
              ) : (
                <Text key={colIdx} color={cell.color || theme.colors.primary}>
                  {cell.char}
                </Text>
              )
            )}
          </Box>
        ))}
      </Box>

      {/* Legend */}
      {showLegend && (
        <Box flexDirection="column" justifyContent="center">
          {itemsWithColors.map((item, idx) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
            return (
              <Box key={idx} flexDirection="row" gap={1}>
                <Text color={item.color}>{LEGEND_SQUARE}</Text>
                <Text color={theme.colors.foreground}>{item.label}</Text>
                {showPercentages && <Text color={theme.colors.mutedForeground}>({pct}%)</Text>}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

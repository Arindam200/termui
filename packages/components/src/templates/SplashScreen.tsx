import { type ReactNode } from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '@termui/core';
import { BigText, type BigTextFont, type BigTextEngine } from '../typography/BigText.js';

export type FigletFont = BigTextFont;

export interface SplashScreenProps {
  title: string;
  /** BigText render engine. Default: `'basic'` (zero deps). Set to `'cfonts'` for richer fonts/gradients (requires `npm install cfonts`). */
  engine?: BigTextEngine;
  font?: BigTextFont;
  titleColor?: string;
  /**
   * Secondary color for the title.
   * - `engine="cfonts"` → forms a smooth gradient across glyphs.
   * - `engine="basic"` → cycles between the two colors per row of the bitmap.
   */
  titleColorAlt?: string;
  bold?: boolean;
  subtitle?: string;
  subtitleDim?: boolean;
  author?: { name: string; href?: string };
  statusLine?: ReactNode;
  padding?: number;
  align?: 'left' | 'center' | 'right';
}

export function SplashScreen({
  title,
  engine = 'basic',
  font = 'block',
  titleColor,
  titleColorAlt,
  bold: _bold = true,
  subtitle,
  subtitleDim = true,
  author,
  statusLine,
  padding = 2,
  align = 'left',
}: SplashScreenProps) {
  const theme = useTheme();
  const resolvedTitleColor = titleColor ?? theme.colors.primary;

  const authorNode = author
    ? author.href
      ? `\x1b]8;;${author.href}\x1b\\${author.name}\x1b]8;;\x1b\\`
      : author.name
    : null;

  // Pick the right title rendering for the engine + alt color combo.
  // - cfonts + alt → smooth glyph gradient
  // - basic  + alt → alternating-row colors (legacy striped look)
  // - either + no alt → solid color
  let titleNode: ReactNode;
  if (titleColorAlt && engine === 'cfonts') {
    titleNode = (
      <BigText
        engine="cfonts"
        font={font}
        gradient={[resolvedTitleColor, titleColorAlt]}
        transitionGradient
        align={align}
      >
        {title}
      </BigText>
    );
  } else if (titleColorAlt) {
    // Two basic renders stacked won't alternate per-row, so we render the
    // title twice (once per color) and overlay via separate Text lines using a
    // simple striping trick: the basic engine emits 5 rows, so we wrap the
    // BigText output in a context-less helper that swaps the color per row.
    titleNode = (
      <BasicAlternating
        title={title}
        color={resolvedTitleColor}
        colorAlt={titleColorAlt}
      />
    );
  } else {
    titleNode = (
      <BigText engine={engine} font={font} color={resolvedTitleColor} align={align}>
        {title}
      </BigText>
    );
  }

  return (
    <Box flexDirection="column" paddingLeft={padding}>
      {titleNode}

      {subtitle && (
        <Box marginTop={1}>
          <Text dimColor={subtitleDim}>{subtitle}</Text>
        </Box>
      )}

      {authorNode && (
        <Box marginTop={1}>
          <Text dimColor>{'Made with ♥ by '}</Text>
          <Text>{authorNode}</Text>
        </Box>
      )}

      {statusLine && <Box marginTop={1}>{statusLine}</Box>}
    </Box>
  );
}

// ─── Basic-engine alternating-row renderer ────────────────────────────────────
// Re-implements the legacy striped look directly so we don't need to inspect
// BigText's output. Uses the same FONT bitmap as BigText for consistency.

import { FONT, FALLBACK, decodeRow } from '../typography/BigText.font.js';

function BasicAlternating({
  title,
  color,
  colorAlt,
}: {
  title: string;
  color: string;
  colorAlt: string;
}) {
  const onChar = '█';
  const offChar = ' ';
  const chars = title.split('');
  const rows = 5;

  return (
    <Box flexDirection="column">
      {Array.from({ length: rows }, (_, rowIdx) => {
        const rowColor = rowIdx % 2 === 0 ? color : colorAlt;
        const line = chars
          .map((ch) => {
            const upper = ch.toUpperCase();
            const glyph = FONT[upper] ?? FONT[ch] ?? FALLBACK;
            const row = decodeRow(glyph[rowIdx] ?? 0);
            return row.map((p) => (p ? onChar : offChar)).join('') + ' ';
          })
          .join('')
          .replace(/\s+$/, '');
        return (
          <Text key={rowIdx} color={rowColor}>
            {line}
          </Text>
        );
      })}
    </Box>
  );
}

import { type ReactNode } from 'react';
import { Box, Text } from 'ink';
import { useTheme } from 'termui';
import {
  BigText,
  type BigTextFont,
  type BigTextEngine,
  BIG_TEXT_FONT,
  BIG_TEXT_FALLBACK,
  decodeBigTextRow,
} from 'termui/components';

export type FigletFont = BigTextFont;

export interface SplashScreenProps {
  title: string;
  /** BigText render engine. Default: `'basic'` (zero deps). Set to `'cfonts'` for richer fonts/gradients (requires `npm install cfonts`). */
  engine?: BigTextEngine;
  font?: BigTextFont;
  titleColor?: string;
  /**
   * Secondary color for the title.
   * - `engine="cfonts"` → smooth gradient across glyphs.
   * - `engine="basic"` → alternating-row colors (legacy striped look).
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
    titleNode = (
      <BasicAlternating title={title} color={resolvedTitleColor} colorAlt={titleColorAlt} />
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
            const glyph = BIG_TEXT_FONT[upper] ?? BIG_TEXT_FONT[ch] ?? BIG_TEXT_FALLBACK;
            const row = decodeBigTextRow(glyph[rowIdx] ?? 0);
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

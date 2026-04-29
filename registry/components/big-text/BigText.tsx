import { useMemo } from 'react';
import { Box, Text } from 'ink';
import { useTheme } from 'termui';
import { FONT, FALLBACK, decodeRow } from './BigText.font.js';

/**
 * BigText — render text as ASCII-art block letters.
 *
 * Two render engines:
 *
 *   1. `engine="basic"` (default) — built-in 5-row bitmap font, zero
 *      dependencies. Supports a single `color`. Ships with the component.
 *
 *   2. `engine="cfonts"` — wraps the optional `cfonts` package. Adds 13 fonts,
 *      multi-color gradients, letter spacing, line height, backgrounds.
 *      Requires `npm install cfonts`. Falls back to the basic engine with a
 *      one-line warning if `cfonts` isn't installed.
 *
 * Example:
 *   <BigText>HELLO</BigText>                                  // basic
 *   <BigText engine="cfonts" font="tiny">HELLO</BigText>      // cfonts
 *   <BigText engine="cfonts" gradient={['red','magenta']} transitionGradient>
 *     TERMUI
 *   </BigText>
 *
 * Props marked **cfonts only** are silently ignored under the basic engine.
 */

export type BigTextFont =
  | 'console'
  | 'block'
  | 'simpleBlock'
  | 'simple'
  | '3d'
  | 'simple3d'
  | 'chrome'
  | 'huge'
  | 'shade'
  | 'slick'
  | 'grid'
  | 'pallet'
  | 'tiny';

export type BigTextAlign = 'left' | 'center' | 'right';

export type BigTextEngine = 'basic' | 'cfonts';

export interface BigTextProps {
  children: string;
  /** Render engine. Default: `'basic'`. Set to `'cfonts'` for richer fonts. */
  engine?: BigTextEngine;
  /** cfonts font name. **cfonts only.** Default: `'block'`. */
  font?: BigTextFont;
  /** Single color (basic) or array of colors (cfonts). Default: theme primary. */
  color?: string | string[];
  /** Two-color gradient. **cfonts only.** */
  gradient?: [string, string];
  /** Smooth gradient transition per character. **cfonts only.** */
  transitionGradient?: boolean;
  /** Background color. **cfonts only.** */
  background?: string;
  /** Horizontal alignment. Default: `'left'`. */
  align?: BigTextAlign;
  /** Letter spacing in columns. **cfonts only.** */
  letterSpacing?: number;
  /** Line height in rows. **cfonts only.** */
  lineHeight?: number;
  /** Add blank lines above/below the block. **cfonts only.** Default: `false`. */
  space?: boolean;
}

let warnedMissingCfonts = false;
let cachedCfonts: typeof import('cfonts') | null | undefined;

function loadCfontsSync(): typeof import('cfonts') | null {
  if (cachedCfonts !== undefined) return cachedCfonts;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createRequire } = require('module') as typeof import('module');
    const req = createRequire(import.meta.url);
    cachedCfonts = req('cfonts') as typeof import('cfonts');
  } catch {
    cachedCfonts = null;
  }
  return cachedCfonts;
}

function renderBasic(text: string, color: string): JSX.Element {
  const onChar = '█';
  const offChar = ' ';
  const chars = text.split('');
  const rows = 5;

  const lines: string[] = Array.from({ length: rows }, (_, rowIdx) =>
    chars
      .map((ch) => {
        const upper = ch.toUpperCase();
        const glyph = FONT[upper] ?? FONT[ch] ?? FALLBACK;
        const row = decodeRow(glyph[rowIdx] ?? 0);
        return row.map((p) => (p ? onChar : offChar)).join('') + ' ';
      })
      .join('')
      .replace(/\s+$/, '')
  );

  return (
    <Box flexDirection="column">
      {lines.map((line, idx) => (
        <Text key={idx} color={color}>
          {line}
        </Text>
      ))}
    </Box>
  );
}

function renderCfonts(props: {
  text: string;
  font: BigTextFont;
  color?: string | string[];
  gradient?: [string, string];
  transitionGradient?: boolean;
  background?: string;
  align: BigTextAlign;
  letterSpacing?: number;
  lineHeight?: number;
  space: boolean;
  fallbackColor: string;
}): JSX.Element | null {
  const cf = loadCfontsSync();
  if (!cf) {
    if (!warnedMissingCfonts) {
      warnedMissingCfonts = true;
      // eslint-disable-next-line no-console
      console.warn(
        '[BigText] engine="cfonts" requested but `cfonts` is not installed. ' +
          'Run `npm install cfonts` for rich fonts/gradients. Falling back to basic engine.'
      );
    }
    return null;
  }

  const colors: string[] = props.gradient
    ? []
    : Array.isArray(props.color)
      ? props.color
      : [props.color ?? props.fallbackColor];

  const rendered = cf.render(props.text, {
    font: props.font,
    colors,
    ...(props.gradient ? { gradient: props.gradient } : {}),
    ...(props.transitionGradient !== undefined
      ? { transitionGradient: props.transitionGradient }
      : {}),
    ...(props.background ? { background: props.background } : {}),
    align: props.align,
    ...(props.letterSpacing !== undefined ? { letterSpacing: props.letterSpacing } : {}),
    ...(props.lineHeight !== undefined ? { lineHeight: props.lineHeight } : {}),
    space: props.space,
    env: 'node',
  });

  const lines: string[] = rendered ? rendered.array : [];
  if (lines.length === 0) return null;

  return (
    <Box flexDirection="column">
      {lines.map((line, idx) => (
        <Text key={idx}>{line}</Text>
      ))}
    </Box>
  );
}

export function BigText({
  children,
  engine = 'basic',
  font = 'block',
  color,
  gradient,
  transitionGradient,
  background,
  align = 'left',
  letterSpacing,
  lineHeight,
  space = false,
}: BigTextProps) {
  const theme = useTheme();
  const fallbackColor =
    (Array.isArray(color) ? color[0] : color) ?? theme.colors.primary;

  const node = useMemo(() => {
    if (engine === 'cfonts') {
      const out = renderCfonts({
        text: children,
        font,
        color,
        gradient,
        transitionGradient,
        background,
        align,
        letterSpacing,
        lineHeight,
        space,
        fallbackColor,
      });
      if (out) return out;
    }
    return renderBasic(children, fallbackColor);
  }, [
    engine,
    children,
    font,
    Array.isArray(color) ? color.join('|') : color,
    gradient?.[0],
    gradient?.[1],
    transitionGradient,
    background,
    align,
    letterSpacing,
    lineHeight,
    space,
    fallbackColor,
  ]);

  return node;
}

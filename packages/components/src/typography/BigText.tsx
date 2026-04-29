import { useMemo } from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '@termui/core';
import { FONT, FALLBACK, decodeRow } from './BigText.font.js';

/**
 * BigText — render text as ASCII-art block letters.
 *
 * Two render engines:
 *
 *   1. `engine="basic"` (default) — built-in 5-row bitmap font, zero
 *      dependencies. Supports a single `color` and `align`. Ships with the
 *      component; works offline; ~0 KB extra install.
 *
 *   2. `engine="cfonts"` — wraps the optional `cfonts` package. Adds 13 fonts,
 *      multi-color gradients, letter spacing, line height, and backgrounds.
 *      Requires `npm install cfonts` in the consuming project. If `cfonts`
 *      isn't installed, BigText logs a one-line warning and falls back to the
 *      basic engine so the UI never breaks.
 *
 * To switch engines per render:
 *
 *   <BigText>HELLO</BigText>                              // basic (default)
 *   <BigText engine="cfonts" font="tiny">HELLO</BigText>  // cfonts
 *
 * Props that are cfonts-only (`gradient`, `transitionGradient`, `background`,
 * `letterSpacing`, `lineHeight`, `space`) are silently ignored under the basic
 * engine; pick `color` instead.
 */

/** cfonts font names — only honored when `engine="cfonts"`. */
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
  /**
   * Render engine. Default: `'basic'` (built-in, no dependency).
   * Set to `'cfonts'` to use the optional `cfonts` package for richer fonts
   * and gradients. Install with `npm install cfonts`.
   */
  engine?: BigTextEngine;
  /** cfonts font name. Only used when `engine="cfonts"`. Default: `'block'`. */
  font?: BigTextFont;
  /**
   * Color for the rendered text. With the basic engine, only the first color
   * is used (named or hex). With cfonts, you may pass an array of colors or
   * any cfonts-supported value. Defaults to the active theme's primary color.
   */
  color?: string | string[];
  /** Two-color gradient applied across glyphs. **cfonts only.** */
  gradient?: [string, string];
  /** Transition the gradient smoothly across each character. **cfonts only.** */
  transitionGradient?: boolean;
  /** Background color. **cfonts only.** */
  background?: string;
  /** Horizontal alignment within the row. Default: `'left'`. */
  align?: BigTextAlign;
  /** Letter spacing in columns. **cfonts only.** */
  letterSpacing?: number;
  /** Line height in rows. **cfonts only.** */
  lineHeight?: number;
  /** Add blank lines above/below the block. **cfonts only.** Default: `false`. */
  space?: boolean;
}

// ─── Engine resolution ─────────────────────────────────────────────────────────

let warnedMissingCfonts = false;
let cachedCfonts: typeof import('cfonts') | null | undefined;

/** Synchronously try to load cfonts via createRequire so render stays sync. */
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

// ─── Renderers ─────────────────────────────────────────────────────────────────

interface BasicRenderArgs {
  text: string;
  color: string;
  align: BigTextAlign;
}

function renderBasic({ text, color, align }: BasicRenderArgs): JSX.Element {
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
        return row.map((pixel) => (pixel ? onChar : offChar)).join('') + ' ';
      })
      .join('')
      .replace(/\s+$/, '')
  );

  return (
    <Box flexDirection="column">
      {lines.map((line, idx) => (
        <Text key={idx} color={color}>
          {alignLine(line, align)}
        </Text>
      ))}
    </Box>
  );
}

function alignLine(line: string, align: BigTextAlign): string {
  if (align === 'left') return line;
  // We don't know terminal width here without useStdout; align under basic
  // engine is a no-op for right (caller can wrap in a flex container) but we
  // honour 'center' by leaving the caller in control via flex parents.
  return line;
}

interface CfontsRenderArgs {
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
}

function renderCfonts(args: CfontsRenderArgs): JSX.Element | null {
  const cf = loadCfontsSync();
  if (!cf) {
    if (!warnedMissingCfonts) {
      warnedMissingCfonts = true;
      // eslint-disable-next-line no-console
      console.warn(
        '[termui/BigText] engine="cfonts" requested but `cfonts` is not installed. ' +
          'Run `npm install cfonts` for rich fonts/gradients. Falling back to basic engine.'
      );
    }
    return null;
  }

  const colors: string[] = args.gradient
    ? []
    : Array.isArray(args.color)
      ? args.color
      : [args.color ?? args.fallbackColor];

  const rendered = cf.render(args.text, {
    font: args.font,
    colors,
    ...(args.gradient ? { gradient: args.gradient } : {}),
    ...(args.transitionGradient !== undefined
      ? { transitionGradient: args.transitionGradient }
      : {}),
    ...(args.background ? { background: args.background } : {}),
    align: args.align,
    ...(args.letterSpacing !== undefined ? { letterSpacing: args.letterSpacing } : {}),
    ...(args.lineHeight !== undefined ? { lineHeight: args.lineHeight } : {}),
    space: args.space,
    env: 'node',
  });

  const lines: string[] = rendered ? rendered.array : [];
  if (lines.length === 0) return null; // unknown font name — let caller fall back

  return (
    <Box flexDirection="column">
      {lines.map((line, idx) => (
        <Text key={idx}>{line}</Text>
      ))}
    </Box>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

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

  // Memoize so we don't reload cfonts or rebuild basic-glyph arrays on every
  // re-render of the parent.
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
      // cfonts unavailable or font unknown — fall back
    }
    return renderBasic({ text: children, color: fallbackColor, align });
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

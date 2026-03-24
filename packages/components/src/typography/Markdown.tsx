import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '@termui/core';

export interface MarkdownProps {
  children: string;
  /** Max width for text wrapping */
  width?: number;
  /** Show a streaming cursor at the end of the last line */
  streaming?: boolean;
  /** Cursor character to show when streaming (default ▌) */
  cursor?: string;
}

interface InlineSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  link?: boolean;
  url?: string;
}

function parseInline(line: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  // Regex matches: **bold**, *italic*, `code`, [text](url)
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\))/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(line)) !== null) {
    if (match.index > last) {
      segments.push({ text: line.slice(last, match.index) });
    }

    const full = match[0]!;
    if (full.startsWith('**')) {
      segments.push({ text: match[2]!, bold: true });
    } else if (full.startsWith('*')) {
      segments.push({ text: match[3]!, italic: true });
    } else if (full.startsWith('`')) {
      segments.push({ text: match[4]!, code: true });
    } else if (full.startsWith('[')) {
      segments.push({ text: match[5]!, link: true, url: match[6] });
    }

    last = match.index + full.length;
  }

  if (last < line.length) {
    segments.push({ text: line.slice(last) });
  }

  return segments;
}

function InlineLine({ segments }: { segments: InlineSegment[] }) {
  const theme = useTheme();

  return (
    <Box>
      {segments.map((seg, i) => {
        if (seg.code) {
          return (
            <Text key={i} color={theme.colors.accent}>
              {seg.text}
            </Text>
          );
        }
        if (seg.link) {
          return (
            <Box key={i}>
              <Text underline color={theme.colors.info}>
                {seg.text}
              </Text>
              <Text dimColor color={theme.colors.mutedForeground}>
                {' '}
                ({seg.url})
              </Text>
            </Box>
          );
        }
        return (
          <Text key={i} bold={seg.bold} italic={seg.italic}>
            {seg.text}
          </Text>
        );
      })}
    </Box>
  );
}

export function Markdown({ children, width, streaming = false, cursor = '▌' }: MarkdownProps) {
  const theme = useTheme();
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    if (!streaming) return;
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, [streaming]);

  // Sanitize partial code fences when streaming
  const safeChildren = streaming ? sanitizePartialFences(children) : children;
  const lines = safeChildren.split('\n');

  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    // Headings
    const h4 = line.match(/^####\s+(.*)/);
    const h3 = line.match(/^###\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const h1 = line.match(/^#\s+(.*)/);

    if (h1) {
      elements.push(
        <Text key={i} bold color={theme.colors.primary}>
          {h1[1]}
        </Text>
      );
    } else if (h2) {
      elements.push(
        <Text key={i} bold color={theme.colors.primary}>
          {h2[1]}
        </Text>
      );
    } else if (h3) {
      elements.push(
        <Text key={i} bold color={theme.colors.primary}>
          {h3[1]}
        </Text>
      );
    } else if (h4) {
      elements.push(
        <Text key={i} color={theme.colors.primary}>
          {h4[1]}
        </Text>
      );
    } else if (line.match(/^---+$/)) {
      // Divider
      elements.push(
        <Text key={i} color={theme.colors.border}>
          {'─'.repeat(width ?? 40)}
        </Text>
      );
    } else if (line.match(/^>\s/)) {
      // Blockquote
      const content = line.replace(/^>\s/, '');
      elements.push(
        <Box key={i} gap={1}>
          <Text color={theme.colors.primary}>│</Text>
          <InlineLine segments={parseInline(content)} />
        </Box>
      );
    } else if (line.match(/^[-*]\s/)) {
      // Bullet list item
      const content = line.replace(/^[-*]\s/, '');
      elements.push(
        <Box key={i} gap={1}>
          <Text color={theme.colors.mutedForeground}>•</Text>
          <InlineLine segments={parseInline(content)} />
        </Box>
      );
    } else if (line === '') {
      elements.push(<Box key={i} />);
    } else {
      elements.push(
        <Box key={i} flexWrap="wrap" width={width}>
          <InlineLine segments={parseInline(line)} />
        </Box>
      );
    }

    i++;
  }

  // Append streaming cursor to the last element
  if (streaming && cursorVisible && elements.length > 0) {
    const last = elements[elements.length - 1];
    elements[elements.length - 1] = (
      <Box key={`cursor-wrapper-${elements.length - 1}`} flexDirection="row">
        {last}
        <Text color={theme.colors.primary}>{cursor}</Text>
      </Box>
    );
  }

  return <Box flexDirection="column">{elements}</Box>;
}

/** Close any unclosed triple-backtick code fences to prevent parse crashes */
function sanitizePartialFences(text: string): string {
  const fenceCount = (text.match(/```/g) ?? []).length;
  if (fenceCount % 2 !== 0) {
    return text + '\n```';
  }
  return text;
}

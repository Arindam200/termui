import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { useTheme, useInput } from '@termui/core';
import { StreamingText } from '../typography/StreamingText.js';
import type { ReactNode } from 'react';

export type ChatRole = 'user' | 'assistant' | 'system' | 'error';

export interface ChatMessageProps {
  role: ChatRole;
  name?: string;
  timestamp?: Date;
  /**
   * Legacy boolean — shows a dots typing indicator.
   * Auto-set to true when `stream` or `streamText` is provided.
   */
  streaming?: boolean;
  collapsed?: boolean;
  children?: ReactNode;
  /**
   * Animate a pre-buffered string in character-by-character.
   * Uses StreamingText internally with `animate={true}`.
   */
  streamText?: string;
  /**
   * Consume a real AsyncIterable<string> (e.g. from an LLM SDK).
   * Chunks are appended live as they arrive.
   */
  stream?: AsyncIterable<string>;
  /** Speed in ms/char for `streamText` animation. Default: 18 */
  streamSpeed?: number;
  /** Called when streaming or animation completes. */
  onStreamComplete?: (fullText: string) => void;
  /**
   * Show prefix + content inline instead of a header row above the content.
   * Default: false
   */
  inline?: boolean;
  /**
   * Override the inline prefix character.
   * Defaults per role: user → `›`, assistant → `◆`, system → `·`, error → `✗`
   */
  prefix?: string;
  /**
   * Show a full-width `─` separator line above the message.
   * Default: true
   */
  showSeparator?: boolean;
  /**
   * Clamp plain-string children to this many lines, appending `… (+N more)`.
   */
  maxLines?: number;
}

const DEFAULT_PREFIX: Record<ChatRole, string> = {
  user: '›',
  assistant: '◆',
  system: '·',
  error: '✗',
};

export function ChatMessage({
  role,
  name,
  timestamp,
  streaming: streamingProp = false,
  collapsed: initialCollapsed = false,
  children,
  streamText,
  stream,
  streamSpeed = 18,
  onStreamComplete,
  inline = false,
  prefix,
  showSeparator = true,
  maxLines,
}: ChatMessageProps) {
  const theme = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  // dots animation — only used when streaming=true with no streamText/stream
  const [dotFrame, setDotFrame] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const isStreaming = streamingProp || !!stream || !!streamText;

  useEffect(() => {
    if (!isStreaming) return;
    const id = setInterval(() => setDotFrame((f) => (f + 1) % 4), 400);
    return () => clearInterval(id);
  }, [isStreaming]);

  useInput((input, key) => {
    if (initialCollapsed && (key.return || input === ' ')) {
      setIsCollapsed((c) => !c);
    }
  });

  const roleColor: Record<ChatRole, string> = {
    user: theme.colors.primary,
    assistant: theme.colors.success ?? 'green',
    system: theme.colors.mutedForeground,
    error: theme.colors.error ?? 'red',
  };

  const color = roleColor[role];
  const dots = ['', '●', '●●', '●●●'][dotFrame] ?? '';
  const resolvedPrefix = prefix ?? DEFAULT_PREFIX[role];

  const contentNode = (() => {
    // ── streamText: animate a pre-buffered string char by char ──
    if (streamText) {
      return (
        <StreamingText
          text={streamText}
          animate
          speed={streamSpeed}
          cursor
          onComplete={(t) => {
            setIsDone(true);
            onStreamComplete?.(t);
          }}
        />
      );
    }

    // ── stream: consume a real AsyncIterable<string> ──
    if (stream) {
      return (
        <StreamingText
          stream={stream}
          cursor
          onComplete={(t) => {
            setIsDone(true);
            onStreamComplete?.(t);
          }}
        />
      );
    }

    // ── legacy streaming boolean: dots indicator ──
    if (isStreaming && !isDone) {
      return children ? (
        <>{children}</>
      ) : (
        <Text color={color} dimColor>
          {dots}
        </Text>
      );
    }

    // ── collapsed ──
    if (isCollapsed) {
      return (
        <Text dimColor>
          {String(children ?? '').slice(0, 60)}
          {String(children ?? '').length > 60 ? '…' : ''}
        </Text>
      );
    }

    // ── maxLines on plain string children ──
    if (maxLines && typeof children === 'string') {
      const lines = children.split('\n');
      const visible = lines.slice(0, maxLines);
      const overflow = lines.length - maxLines;
      return (
        <>
          <Text>{visible.join('\n')}</Text>
          {overflow > 0 && (
            <Text dimColor color={theme.colors.mutedForeground}>
              {`… (+${overflow} more)`}
            </Text>
          )}
        </>
      );
    }

    return <>{children}</>;
  })();

  return (
    <Box flexDirection="column" marginBottom={0}>
      {showSeparator && (
        <Text color={theme.colors.border} dimColor>
          {'─'.repeat(72)}
        </Text>
      )}

      {inline ? (
        <Box flexDirection="row" gap={1}>
          <Text color={color} bold>
            {resolvedPrefix}
          </Text>
          <Box flexDirection="column">{contentNode}</Box>
        </Box>
      ) : (
        <>
          <Box gap={1}>
            <Text color={color} bold>
              {name ?? role}
            </Text>
            {timestamp && (
              <Text dimColor color={theme.colors.mutedForeground}>
                {formatTime(timestamp)}
              </Text>
            )}
            {isCollapsed && !isStreaming && (
              <Text dimColor color={theme.colors.mutedForeground}>
                [expand]
              </Text>
            )}
          </Box>
          <Box paddingLeft={2}>{contentNode}</Box>
        </>
      )}
    </Box>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

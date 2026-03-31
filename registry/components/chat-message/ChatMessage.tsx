import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { useTheme, useInput } from 'termui';
import type { ReactNode } from 'react';

export type ChatRole = 'user' | 'assistant' | 'system' | 'error';

export interface ChatMessageProps {
  role: ChatRole;
  name?: string;
  timestamp?: Date;
  streaming?: boolean;
  collapsed?: boolean;
  children?: ReactNode;
}

export function ChatMessage({
  role,
  name,
  timestamp,
  streaming = false,
  collapsed: initialCollapsed = false,
  children,
}: ChatMessageProps) {
  const theme = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [dotFrame, setDotFrame] = useState(0);

  // Typing indicator animation
  useEffect(() => {
    if (!streaming) return;
    const id = setInterval(() => setDotFrame((f) => (f + 1) % 4), 400);
    return () => clearInterval(id);
  }, [streaming]);

  // Toggle collapse on Enter/Space when focused
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

  const roleLabel: Record<ChatRole, string> = {
    user: 'user',
    assistant: 'assistant',
    system: 'system',
    error: 'error',
  };

  const color = roleColor[role];

  const dots = ['', '●', '●●', '●●●'][dotFrame] ?? '';

  // Get first line of children for collapsed display
  const childrenText = typeof children === 'string' ? children : '';
  const firstLine = childrenText.split('\n')[0] ?? '';

  return (
    <Box flexDirection="column" marginBottom={1}>
      {/* Header row */}
      <Box gap={1}>
        <Text color={color} bold>
          {name ?? roleLabel[role]}
        </Text>
        {timestamp && (
          <Text dimColor color={theme.colors.mutedForeground}>
            {formatTime(timestamp)}
          </Text>
        )}
        {isCollapsed && !streaming && (
          <Text dimColor color={theme.colors.mutedForeground}>
            [expand]
          </Text>
        )}
      </Box>

      {/* Content */}
      {streaming ? (
        <Box>
          {children ? (
            <>{children}</>
          ) : (
            <Text color={color} dimColor>
              {dots}
            </Text>
          )}
        </Box>
      ) : isCollapsed ? (
        <Box>
          <Text dimColor>
            {firstLine.slice(0, 60)}
            {firstLine.length > 60 || childrenText.includes('\n') ? '...' : ''}
          </Text>
        </Box>
      ) : (
        <Box>{children}</Box>
      )}
    </Box>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

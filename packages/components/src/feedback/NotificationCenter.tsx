/**
 * NotificationCenter — renders the active notification queue.
 *
 * @example
 * ```tsx
 * // Wrap your app:
 * // function App() {
 * //   return (
 * //     <NotificationsProvider>
 * //       <MyApp />
 * //       <NotificationCenter />
 * //     </NotificationsProvider>
 * //   );
 * // }
 * //
 * // Anywhere inside:
 * // const { notify } = useNotifications();
 * // notify({ title: 'Saved', body: 'File saved successfully.', variant: 'success', duration: 3000 });
 * ```
 */

import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import { useNotifications, useTheme } from '@termui/core';
import type { NotificationVariant } from '@termui/core';

export interface NotificationCenterProps {
  /** Maximum number of notifications to display at once. Default: 3 */
  maxVisible?: number;
  /** Render order — 'bottom' shows newest at bottom, 'top' shows newest at top. Default: 'bottom' */
  position?: 'top' | 'bottom';
}

const ICONS: Record<NotificationVariant, string> = {
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
};

function variantColor(
  variant: NotificationVariant,
  theme: ReturnType<typeof useTheme>
): string {
  switch (variant) {
    case 'success':
      return theme.colors.success;
    case 'error':
      return theme.colors.error;
    case 'warning':
      return theme.colors.warning;
    default:
      return theme.colors.info;
  }
}

interface NotificationItemProps {
  id: string;
  title: string;
  body?: string;
  variant: NotificationVariant;
  duration?: number;
  persistent?: boolean;
  onDismiss: (id: string) => void;
}

function NotificationItem({
  id,
  title,
  body,
  variant,
  duration,
  persistent,
  onDismiss,
}: NotificationItemProps) {
  const theme = useTheme();
  const color = variantColor(variant, theme);
  const icon = ICONS[variant];

  // Auto-dismiss after duration unless persistent
  useEffect(() => {
    if (persistent) return;
    const ms = duration ?? 5000;
    const timer = setTimeout(() => onDismiss(id), ms);
    return () => clearTimeout(timer);
  }, [id, duration, persistent, onDismiss]);

  return (
    <Box
      borderStyle={theme.border.style}
      borderColor={color}
      paddingX={1}
      paddingY={0}
      flexDirection="column"
    >
      <Box gap={1}>
        <Text color={color} bold>
          {icon}
        </Text>
        <Text bold color={color}>
          {title}
        </Text>
      </Box>
      {body ? <Text>{body}</Text> : null}
    </Box>
  );
}

export function NotificationCenter({
  maxVisible = 3,
  position = 'bottom',
}: NotificationCenterProps) {
  const { notifications, dismiss } = useNotifications();

  if (notifications.length === 0) return null;

  // Slice to the most recent maxVisible notifications.
  // "Most recent" = last in array (notify() appends to tail).
  const visible = notifications.slice(-maxVisible);

  // 'top' position: newest at top (reverse render order)
  const ordered = position === 'top' ? [...visible].reverse() : visible;

  return (
    <Box flexDirection="column">
      {ordered.map((n) => (
        <NotificationItem
          key={n.id}
          id={n.id}
          title={n.title}
          body={n.body}
          variant={n.variant}
          duration={n.duration}
          persistent={n.persistent}
          onDismiss={dismiss}
        />
      ))}
    </Box>
  );
}

import React, { type ReactNode } from 'react';
import { Box, Text } from 'ink';
import { useTheme } from 'termui';

export interface BulletListItemProps {
  label: string;
  bold?: boolean;
  color?: string;
  children?: ReactNode;
}

export interface BulletListTreeItemProps {
  label: string;
  color?: string;
}

export interface BulletListCheckItemProps {
  label: string;
  done?: boolean;
  color?: string;
}

function BulletListRoot({ children }: { children: ReactNode }) {
  return <Box flexDirection="column">{children}</Box>;
}

function BulletListItem({ label, bold: boldText = false, color, children }: BulletListItemProps) {
  const theme = useTheme();
  return (
    <Box flexDirection="column">
      <Box flexDirection="row">
        <Text color={color ?? theme.colors.primary}>{'● '}</Text>
        <Text bold={boldText} color={color}>
          {label}
        </Text>
      </Box>
      {children}
    </Box>
  );
}

function BulletListSub({ children }: { children: ReactNode }) {
  return (
    <Box flexDirection="column" paddingLeft={2}>
      {children}
    </Box>
  );
}

function BulletListTreeItem({ label, color }: BulletListTreeItemProps) {
  const theme = useTheme();
  return (
    <Box flexDirection="row">
      <Text color={theme.colors.mutedForeground}>{'└ '}</Text>
      <Text color={color}>{label}</Text>
    </Box>
  );
}

function BulletListCheckItem({ label, done = false, color }: BulletListCheckItemProps) {
  const theme = useTheme();
  const icon = done ? '■' : '□';
  const resolvedColor = color ?? (done ? theme.colors.success : theme.colors.mutedForeground);
  return (
    <Box flexDirection="row">
      <Text color={resolvedColor}>{icon + ' '}</Text>
      <Text color={done ? undefined : color}>{label}</Text>
    </Box>
  );
}

export const BulletList = Object.assign(BulletListRoot, {
  Item: BulletListItem,
  Sub: BulletListSub,
  TreeItem: BulletListTreeItem,
  CheckItem: BulletListCheckItem,
});

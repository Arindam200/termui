import React from 'react';
import { Box } from 'ink';
import type { ReactNode } from 'react';

export interface ColumnsProps {
  children: ReactNode;
  gap?: number;
  align?: 'top' | 'center' | 'bottom';
}

const ALIGN_MAP: Record<
  NonNullable<ColumnsProps['align']>,
  'flex-start' | 'center' | 'flex-end'
> = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
};

export function Columns({ children, gap = 0, align = 'top' }: ColumnsProps) {
  const items = React.Children.toArray(children);

  return (
    <Box flexDirection="row" gap={gap} alignItems={ALIGN_MAP[align]}>
      {items.map((child, index) => (
        <Box key={index} flexGrow={1} flexDirection="column">
          {child}
        </Box>
      ))}
    </Box>
  );
}

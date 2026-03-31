import React, { type ReactNode } from 'react';
import { Box, Text } from 'ink';
import { useTheme } from 'termui';
import { BigText, type BigTextFont } from 'termui/components';

export interface HelpScreenProps {
  title: string;
  font?: BigTextFont;
  titleColor?: string;
  tagline?: string;
  usage?: string;
  description?: string;
  columnGap?: number;
  flagWidth?: number;
  children: ReactNode;
}

export interface HelpScreenSectionProps {
  label: string;
  labelColor?: string;
  children: ReactNode;
}

export interface HelpScreenRowProps {
  flag: string;
  description: string;
  flagColor?: string;
  descriptionColor?: string;
}

function computeFlagWidth(children: ReactNode): number {
  let max = 0;
  React.Children.forEach(children, (section) => {
    if (React.isValidElement(section)) {
      React.Children.forEach(section.props.children as ReactNode, (row) => {
        const rowProps = React.isValidElement(row) ? (row.props as Record<string, unknown>) : null;
        if (rowProps && rowProps['flag']) {
          max = Math.max(max, String(rowProps['flag']).length);
        }
      });
    }
  });
  return max;
}

function HelpScreenRoot({
  title,
  font = 'block',
  titleColor,
  tagline,
  usage,
  description,
  columnGap = 4,
  flagWidth,
  children,
}: HelpScreenProps) {
  const theme = useTheme();
  const resolvedColor = titleColor ?? theme.colors.primary;

  // Auto-detect flagWidth if not provided
  const resolvedFlagWidth = flagWidth ?? computeFlagWidth(children);

  // Inject flagWidth + columnGap into section children
  const enrichedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        _flagWidth: resolvedFlagWidth,
        _columnGap: columnGap,
      });
    }
    return child;
  });

  return (
    <Box flexDirection="column" paddingLeft={2}>
      <Box marginBottom={1}>
        <BigText font={font} color={resolvedColor}>
          {title}
        </BigText>
      </Box>

      {tagline && (
        <Box marginBottom={1}>
          <Text dimColor>{tagline}</Text>
        </Box>
      )}

      {usage && (
        <Box marginBottom={1}>
          <Text>
            <Text dimColor>{'Usage: '}</Text>
            {usage}
          </Text>
        </Box>
      )}

      {description && (
        <Box marginBottom={1}>
          <Text>{description}</Text>
        </Box>
      )}

      {enrichedChildren}
    </Box>
  );
}

function HelpScreenSection({
  label,
  labelColor,
  children,
  // injected by parent
  _flagWidth = 20,
  _columnGap = 4,
}: HelpScreenSectionProps & { _flagWidth?: number; _columnGap?: number }) {
  const theme = useTheme();

  const enrichedRows = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        _flagWidth,
        _columnGap,
      });
    }
    return child;
  });

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text bold color={labelColor ?? theme.colors.foreground}>
        {label}
      </Text>
      {enrichedRows}
    </Box>
  );
}

function HelpScreenRow({
  flag,
  description,
  flagColor,
  descriptionColor,
  _flagWidth = 20,
  _columnGap = 4,
}: HelpScreenRowProps & { _flagWidth?: number; _columnGap?: number }) {
  const theme = useTheme();
  const paddedFlag = flag.padEnd(_flagWidth + _columnGap);

  return (
    <Box flexDirection="row" paddingLeft={2}>
      <Text color={flagColor ?? theme.colors.mutedForeground}>{paddedFlag}</Text>
      <Text color={descriptionColor}>{description}</Text>
    </Box>
  );
}

export const HelpScreen = Object.assign(HelpScreenRoot, {
  Section: HelpScreenSection,
  Row: HelpScreenRow,
});

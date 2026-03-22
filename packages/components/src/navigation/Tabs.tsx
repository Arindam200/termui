import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useInput, useTheme } from '@termui/core';
import type { ReactNode } from 'react';

export interface Tab {
  key: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (key: string) => void;
  borderColor?: string;
}

export function Tabs({ tabs, defaultTab, activeTab: controlledTab, onTabChange, borderColor }: TabsProps) {
  const theme = useTheme();
  const [internalTab, setInternalTab] = useState(defaultTab ?? tabs[0]?.key ?? '');
  const activeKey = controlledTab ?? internalTab;
  const activeIndex = tabs.findIndex((t) => t.key === activeKey);

  const resolvedBorderColor = borderColor ?? theme.colors.border;

  useInput((input, key) => {
    if (key.leftArrow || (key.shift && key.tab)) {
      const next = Math.max(0, activeIndex - 1);
      const nextKey = tabs[next]?.key;
      if (nextKey) {
        onTabChange ? onTabChange(nextKey) : setInternalTab(nextKey);
      }
    } else if (key.rightArrow || key.tab) {
      const next = Math.min(tabs.length - 1, activeIndex + 1);
      const nextKey = tabs[next]?.key;
      if (nextKey) {
        onTabChange ? onTabChange(nextKey) : setInternalTab(nextKey);
      }
    }
  });

  const activeTab = tabs.find((t) => t.key === activeKey);

  return (
    <Box flexDirection="column">
      {/* Tab bar */}
      <Box borderStyle="single" borderColor={resolvedBorderColor} paddingX={1}>
        {tabs.map((tab, idx) => {
          const isActive = tab.key === activeKey;
          return (
            <Box key={tab.key} paddingX={1}>
              <Text
                color={isActive ? theme.colors.primary : theme.colors.mutedForeground}
                bold={isActive}
                underline={isActive}
              >
                {tab.label}
              </Text>
              {idx < tabs.length - 1 && (
                <Text color={resolvedBorderColor}> │ </Text>
              )}
            </Box>
          );
        })}
      </Box>
      {/* Content */}
      <Box borderStyle="single" borderColor={resolvedBorderColor} paddingX={1} paddingY={0}>
        {activeTab?.content}
      </Box>
    </Box>
  );
}

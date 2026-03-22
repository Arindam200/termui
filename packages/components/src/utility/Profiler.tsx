/**
 * Profiler — wraps React.Profiler to display render timing stats.
 *
 * Shows component ID, render count, and last render duration in a
 * compact overlay. Intended for development use only.
 *
 * @example
 * ```tsx
 * <Profiler id="MyList" show>
 *   <MyList items={data} />
 * </Profiler>
 * ```
 */
import React, { Profiler as ReactProfiler, type ProfilerOnRenderCallback, useState } from 'react';
import { Box, Text } from 'ink';

export interface ProfilerProps {
  /** Identifier shown in the stats overlay */
  id: string;
  /** Children to profile */
  children: React.ReactNode;
  /** Show the overlay (default true) */
  show?: boolean;
}

interface Stats {
  count: number;
  lastMs: number;
  totalMs: number;
  peakMs: number;
  phase: 'mount' | 'update';
}

export function Profiler({ id, children, show = true }: ProfilerProps) {
  const [stats, setStats] = useState<Stats>({
    count: 0,
    lastMs: 0,
    totalMs: 0,
    peakMs: 0,
    phase: 'mount',
  });

  const onRender: ProfilerOnRenderCallback = (_id, phase, actualDuration) => {
    setStats((prev) => ({
      count: prev.count + 1,
      lastMs: actualDuration,
      totalMs: prev.totalMs + actualDuration,
      peakMs: Math.max(prev.peakMs, actualDuration),
      phase: phase as 'mount' | 'update',
    }));
  };

  return (
    <ReactProfiler id={id} onRender={onRender}>
      <Box flexDirection="column">
        {children}
        {show && (
          <Box borderStyle="single" borderColor="gray" paddingX={1} marginTop={1}>
            <Text dimColor>
              [{id}] renders:{stats.count} last:{stats.lastMs.toFixed(1)}ms peak:
              {stats.peakMs.toFixed(1)}ms avg:
              {stats.count > 0 ? (stats.totalMs / stats.count).toFixed(1) : '0.0'}ms phase:
              {stats.phase}
            </Text>
          </Box>
        )}
      </Box>
    </ReactProfiler>
  );
}

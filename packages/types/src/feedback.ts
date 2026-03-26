import type { AriaProps } from './common.js';

export interface SpinnerProps extends AriaProps {
  style?:
    | 'dots'
    | 'line'
    | 'star'
    | 'clock'
    | 'bounce'
    | 'bar'
    | 'arc'
    | 'arrow'
    | 'toggle'
    | 'box'
    | 'pipe'
    | 'earth';
  label?: string;
  color?: string;
  fps?: number;
  frames?: string[];
  reducedMotion?: boolean;
}

export interface ProgressBarProps extends AriaProps {
  value: number;
  total?: number;
  label?: string;
  color?: string;
  width?: number;
  showPercent?: boolean;
  showETA?: boolean;
  reducedMotion?: boolean;
}

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children?: unknown;
}

export interface ToastProps extends AlertProps {
  duration?: number;
  onDismiss?: () => void;
}

export interface SkeletonProps {
  width?: number;
  lines?: number;
  animated?: boolean;
  reducedMotion?: boolean;
}

export interface StatusMessageProps {
  variant?: AlertVariant;
  children?: unknown;
}

export interface BannerProps {
  variant?: AlertVariant;
  children?: unknown;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export type MultiProgressStatus = 'pending' | 'running' | 'done' | 'error';

export interface MultiProgressItem {
  id: string;
  label: string;
  value: number;
  total: number;
  status?: MultiProgressStatus;
  statusText?: string;
}

export interface MultiProgressProps {
  items: MultiProgressItem[];
  barWidth?: number;
  labelWidth?: number;
  compact?: boolean;
  showPercent?: boolean;
}

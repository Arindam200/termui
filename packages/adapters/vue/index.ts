/**
 * termui/vue — type bridge for Vue 3 users.
 *
 * TermUI components are React/Ink components, but their prop interfaces
 * are available framework-agnostically via @termui/types.
 *
 * This module re-exports all @termui/types interfaces and provides
 * Vue 3 composition API helpers for common TermUI patterns.
 */

// ─── Feedback ──────────────────────────────────────────────────────────────────
export type {
  SpinnerProps,
  ProgressBarProps,
  AlertProps,
  AlertVariant,
  ToastProps,
  SkeletonProps,
  StatusMessageProps,
  BannerProps,
  MultiProgressItem,
  MultiProgressProps,
  MultiProgressStatus,
} from '@termui/types';

// ─── Input ─────────────────────────────────────────────────────────────────────
export type {
  TextInputProps,
  TextAreaProps,
  PasswordInputProps,
  NumberInputProps,
  SearchInputProps,
} from '@termui/types';

// ─── Selection ─────────────────────────────────────────────────────────────────
export type {
  SelectProps,
  MultiSelectProps,
  CheckboxProps,
  RadioGroupProps,
  ToggleProps,
} from '@termui/types';

// ─── Data ──────────────────────────────────────────────────────────────────────
export type {
  TableProps,
  TableColumn,
  ListProps,
  ListItem,
  TreeProps,
  TreeNode,
} from '@termui/types';

// ─── Navigation ────────────────────────────────────────────────────────────────
export type {
  TabsProps,
  TabItem,
  BreadcrumbProps,
  BreadcrumbItem,
  PaginationProps,
} from '@termui/types';

// ─── Overlays ──────────────────────────────────────────────────────────────────
export type { ModalProps, DialogProps, DrawerProps, TooltipProps } from '@termui/types';

// ─── Forms ─────────────────────────────────────────────────────────────────────
export type { FormProps, FormField, FormFieldProps, ConfirmProps } from '@termui/types';

// ─── Layout ────────────────────────────────────────────────────────────────────
export type { BoxProps, StackProps } from '@termui/types';

// ─── Typography ────────────────────────────────────────────────────────────────
export type { TextProps, HeadingProps, BadgeProps, CodeProps } from '@termui/types';

// ─── Charts ────────────────────────────────────────────────────────────────────
export type {
  SparklineProps,
  BarChartProps,
  LineChartProps,
  GaugeProps,
  DataPoint,
} from '@termui/types';

// ─── Utility ───────────────────────────────────────────────────────────────────
export type {
  TimerProps,
  ClockProps,
  LogProps,
  LogEntry,
  QRCodeProps,
  ImageProps,
} from '@termui/types';

// ─── Theme ─────────────────────────────────────────────────────────────────────
export type {
  Theme,
  ColorTokens,
  SpacingTokens,
  TypographyTokens,
  BorderTokens,
} from '@termui/types';

// ─── Common primitives ─────────────────────────────────────────────────────────
export type {
  AriaProps,
  AriaLive,
  BorderStyle,
  ColorVariant,
  TextAlign,
  Direction,
  Size,
  SelectOption,
} from '@termui/types';

// ─── AI ────────────────────────────────────────────────────────────────────────
export type {
  ChatRole,
  ChatMessageProps,
  ChatThreadProps,
  ToolCallStatus,
  ToolCallProps,
  ThinkingBlockProps,
  TokenUsageProps,
  ContextMeterProps,
  RiskLevel,
  ToolApprovalProps,
  ModelOption,
  ModelSelectorProps,
  FileChangeType,
  FileChangeItem,
  FileChangeProps,
} from '@termui/types';

// ─── Vue 3 composition utilities for terminal state ────────────────────────────
export { useTerminalSize } from './useTerminalSize.js';
export { useThemeTokens, TERMUI_THEME_KEY } from './useThemeTokens.js';

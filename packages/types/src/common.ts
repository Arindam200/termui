/**
 * Common types used across multiple TermUI components.
 * @packageDocumentation
 */

/** Border style variants supported by Ink/TermUI box components */
export type BorderStyle =
  | 'single'
  | 'double'
  | 'round'
  | 'bold'
  | 'singleDouble'
  | 'doubleSingle'
  | 'classic';

/** Semantic color variants used for status-driven styling */
export type ColorVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

/** Text alignment */
export type TextAlign = 'left' | 'center' | 'right';

/** Orientation/direction */
export type Direction = 'horizontal' | 'vertical';

/** Accessible ARIA live region urgency */
export type AriaLive = 'polite' | 'assertive';

/** Base aria accessibility props shared by all interactive components */
export interface AriaProps {
  /** Accessible name announced by screen readers */
  'aria-label'?: string;
  /** Secondary description text */
  'aria-description'?: string;
  /** Controls urgency of dynamic announcements */
  'aria-live'?: AriaLive;
}

/** Common size variants */
export type Size = 'sm' | 'md' | 'lg';

/** Option shape for select-style components */
export interface SelectOption<T = string> {
  value: T;
  label: string;
  hint?: string;
  disabled?: boolean;
}

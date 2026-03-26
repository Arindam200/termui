import type { BorderStyle } from './common.js';

export interface BoxProps {
  width?: number | string;
  height?: number | string;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  gap?: number;
  padding?: number;
  margin?: number;
  borderStyle?: BorderStyle;
  borderColor?: string;
  flexGrow?: number;
  flexShrink?: number;
}

export interface StackProps {
  direction?: 'horizontal' | 'vertical';
  gap?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
}

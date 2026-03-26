export interface TextProps {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  dimColor?: boolean;
  color?: string;
  backgroundColor?: string;
  wrap?: 'wrap' | 'truncate' | 'truncate-start' | 'truncate-middle' | 'truncate-end';
}

export interface HeadingProps {
  level?: 1 | 2 | 3 | 4;
  children?: unknown;
  color?: string;
  figlet?: boolean;
  font?: string;
}

export interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  children?: unknown;
}

export interface CodeProps {
  language?: string;
  theme?: string;
  lineNumbers?: boolean;
  children?: string;
}

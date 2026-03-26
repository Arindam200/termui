import type { AriaProps } from './common.js';

export interface TextInputProps extends AriaProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  focus?: boolean;
  mask?: string;
  showCursor?: boolean;
}

export interface TextAreaProps extends AriaProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  focus?: boolean;
}

export interface PasswordInputProps extends Omit<TextInputProps, 'mask'> {
  showToggle?: boolean;
}

export interface NumberInputProps extends AriaProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export interface SearchInputProps extends AriaProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounce?: number;
}

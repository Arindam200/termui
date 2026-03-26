import type { AriaProps, SelectOption } from './common.js';

export interface SelectProps<T = string> extends AriaProps {
  options: Array<SelectOption<T>>;
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  onSubmit?: (value: T) => void;
  label?: string;
  placeholder?: string;
  searchable?: boolean;
}

export interface MultiSelectProps<T = string> extends AriaProps {
  options: Array<SelectOption<T>>;
  value?: T[];
  defaultValue?: T[];
  onChange?: (values: T[]) => void;
  onSubmit?: (values: T[]) => void;
  label?: string;
  max?: number;
}

export interface CheckboxProps extends AriaProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  indeterminate?: boolean;
}

export interface RadioGroupProps<T = string> extends AriaProps {
  options: Array<SelectOption<T>>;
  value?: T;
  onChange?: (value: T) => void;
  label?: string;
}

export interface ToggleProps extends AriaProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
}

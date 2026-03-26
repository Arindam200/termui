export interface FormField {
  name: string;
  validate?: (value: unknown) => string | null | undefined;
}

export interface FormProps {
  fields?: FormField[];
  onSubmit?: (values: Record<string, unknown>) => void;
  onReset?: () => void;
}

export interface FormFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  hint?: string;
}

export interface ConfirmProps {
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

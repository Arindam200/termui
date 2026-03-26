import type { AriaProps } from './common.js';

export interface ModalProps extends AriaProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  width?: number;
}

export interface DialogProps extends AriaProps {
  open?: boolean;
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface DrawerProps extends AriaProps {
  open?: boolean;
  edge?: 'top' | 'bottom' | 'left' | 'right';
  size?: number;
  onClose?: () => void;
}

export interface TooltipProps {
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

import type { AriaProps } from './common.js';

export interface TabItem {
  label: string;
  disabled?: boolean;
}

export interface TabsProps extends AriaProps {
  items: string[] | TabItem[];
  activeIndex?: number;
  defaultIndex?: number;
  onChange?: (index: number) => void;
}

export interface BreadcrumbItem {
  label: string;
  onSelect?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: string;
}

export interface PaginationProps extends AriaProps {
  page: number;
  total: number;
  pageSize?: number;
  onChange?: (page: number) => void;
}

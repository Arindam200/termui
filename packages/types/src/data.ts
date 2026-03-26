export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T & string;
  header: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T) => unknown;
  sortable?: boolean;
}

export interface TableProps<T = Record<string, unknown>> {
  data: T[];
  columns: TableColumn<T>[];
  sortable?: boolean;
  selectable?: boolean;
  onSelect?: (row: T) => void;
  pageSize?: number;
}

export interface ListItem<T = string> {
  label: string;
  value: T;
  hint?: string;
  disabled?: boolean;
}

export interface ListProps<T = string> {
  items: ListItem<T>[];
  onSelect?: (item: ListItem<T>) => void;
  filterable?: boolean;
}

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  expanded?: boolean;
  icon?: string;
}

export interface TreeProps {
  nodes: TreeNode[];
  onSelect?: (node: TreeNode) => void;
  onExpand?: (node: TreeNode) => void;
}

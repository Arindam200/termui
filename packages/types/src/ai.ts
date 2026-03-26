/**
 * Framework-agnostic types for AI components.
 * No React/Ink dependency — uses `unknown` for ReactNode slots.
 * @packageDocumentation
 */

// ─── ChatMessage ───────────────────────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant' | 'system' | 'error';

export interface ChatMessageProps {
  role: ChatRole;
  name?: string;
  timestamp?: Date;
  streaming?: boolean;
  collapsed?: boolean;
  children?: unknown;
}

// ─── ChatThread ────────────────────────────────────────────────────────────────

export interface ChatThreadProps {
  maxHeight?: number;
  autoScroll?: boolean;
  children?: unknown;
}

// ─── ToolCall ──────────────────────────────────────────────────────────────────

export type ToolCallStatus = 'pending' | 'running' | 'success' | 'error';

export interface ToolCallProps {
  name: string;
  args?: Record<string, unknown>;
  status: ToolCallStatus;
  result?: unknown;
  duration?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

// ─── ThinkingBlock ─────────────────────────────────────────────────────────────

export interface ThinkingBlockProps {
  content: string;
  streaming?: boolean;
  defaultCollapsed?: boolean;
  label?: string;
  tokenCount?: number;
  duration?: number;
}

// ─── TokenUsage ────────────────────────────────────────────────────────────────

export interface TokenUsageProps {
  prompt: number;
  completion: number;
  model?: string;
  showCost?: boolean;
}

export interface ContextMeterProps {
  used: number;
  limit: number;
  label?: string;
  showPercent?: boolean;
  warnAt?: number;
  criticalAt?: number;
  width?: number;
}

// ─── ToolApproval ──────────────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high';

export interface ToolApprovalProps {
  name: string;
  description?: string;
  args?: Record<string, unknown>;
  risk?: RiskLevel;
  onApprove: () => void;
  onDeny: () => void;
  onAlwaysAllow?: () => void;
  /** Auto-deny timeout in seconds */
  timeout?: number;
}

// ─── ModelSelector ─────────────────────────────────────────────────────────────

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  context?: number;
}

export interface ModelSelectorProps {
  models: ModelOption[];
  selected: string;
  onSelect: (id: string) => void;
  showContext?: boolean;
  showProvider?: boolean;
  groupByProvider?: boolean;
}

// ─── FileChange ────────────────────────────────────────────────────────────────

export type FileChangeType = 'modify' | 'create' | 'delete';

export interface FileChangeItem {
  path: string;
  type: FileChangeType;
  diff?: string;
  content?: string;
}

export interface FileChangeProps {
  changes: FileChangeItem[];
  onAccept?: (path: string) => void;
  onReject?: (path: string) => void;
  onAcceptAll?: () => void;
}

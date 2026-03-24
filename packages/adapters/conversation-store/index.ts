/**
 * termui/conversation-store — File-based conversation persistence.
 * Stores conversations as JSON or JSONL in a configurable directory.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConversationFormat = 'json' | 'jsonl';

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ConversationRecord {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  model?: string;
  messages: ConversationMessage[];
  metadata?: Record<string, unknown>;
}

export interface ConversationStoreOptions {
  /** Directory to store conversation files */
  dir: string;
  /** File format: 'json' (default) or 'jsonl' */
  format?: ConversationFormat;
}

export interface ConversationStore {
  save(conversation: ConversationRecord): Promise<void>;
  load(id: string): Promise<ConversationRecord | null>;
  list(): Promise<ConversationRecord[]>;
  delete(id: string): Promise<boolean>;
  search(query: string): Promise<ConversationRecord[]>;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createConversationStore(options: ConversationStoreOptions): ConversationStore {
  const { dir, format = 'json' } = options;

  // Ensure directory exists
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  function filePath(id: string): string {
    return join(dir, `${id}.${format === 'jsonl' ? 'jsonl' : 'json'}`);
  }

  function serializeJson(conversation: ConversationRecord): string {
    return JSON.stringify(conversation, null, 2);
  }

  function serializeJsonl(conversation: ConversationRecord): string {
    // Store header as first line, then one message per line
    const header = { ...conversation, messages: [] };
    const lines = [JSON.stringify(header), ...conversation.messages.map((m) => JSON.stringify(m))];
    return lines.join('\n');
  }

  function deserializeJson(content: string): ConversationRecord {
    return JSON.parse(content) as ConversationRecord;
  }

  function deserializeJsonl(content: string): ConversationRecord {
    const lines = content.trim().split('\n').filter(Boolean);
    if (lines.length === 0) {
      throw new Error('Empty JSONL file');
    }
    const header = JSON.parse(lines[0]!) as ConversationRecord;
    const messages = lines.slice(1).map((line) => JSON.parse(line) as ConversationMessage);
    return { ...header, messages };
  }

  function serialize(conversation: ConversationRecord): string {
    return format === 'jsonl' ? serializeJsonl(conversation) : serializeJson(conversation);
  }

  function deserialize(content: string): ConversationRecord {
    return format === 'jsonl' ? deserializeJsonl(content) : deserializeJson(content);
  }

  async function save(conversation: ConversationRecord): Promise<void> {
    const path = filePath(conversation.id);
    const content = serialize({
      ...conversation,
      updatedAt: new Date().toISOString(),
    });
    writeFileSync(path, content, 'utf-8');
  }

  async function load(id: string): Promise<ConversationRecord | null> {
    const path = filePath(id);
    if (!existsSync(path)) return null;
    try {
      const content = readFileSync(path, 'utf-8');
      return deserialize(content);
    } catch {
      return null;
    }
  }

  async function list(): Promise<ConversationRecord[]> {
    if (!existsSync(dir)) return [];

    const ext = format === 'jsonl' ? '.jsonl' : '.json';
    const files = readdirSync(dir).filter((f) => f.endsWith(ext));

    const conversations: ConversationRecord[] = [];
    for (const file of files) {
      try {
        const content = readFileSync(join(dir, file), 'utf-8');
        conversations.push(deserialize(content));
      } catch {
        // Skip corrupted files
      }
    }

    // Sort by updatedAt descending
    return conversations.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async function deleteConversation(id: string): Promise<boolean> {
    const path = filePath(id);
    if (!existsSync(path)) return false;
    try {
      unlinkSync(path);
      return true;
    } catch {
      return false;
    }
  }

  async function search(query: string): Promise<ConversationRecord[]> {
    const all = await list();
    const q = query.toLowerCase();
    return all.filter((conv) => {
      if (conv.title?.toLowerCase().includes(q)) return true;
      if (conv.id.toLowerCase().includes(q)) return true;
      return conv.messages.some((m) => m.content.toLowerCase().includes(q));
    });
  }

  return {
    save,
    load,
    list,
    delete: deleteConversation,
    search,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a URL-safe conversation ID based on timestamp + random suffix */
export function generateConversationId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `${ts}-${rand}`;
}

/** Create a new empty conversation record */
export function createConversation(
  opts: { id?: string; title?: string; model?: string } = {}
): ConversationRecord {
  const now = new Date().toISOString();
  return {
    id: opts.id ?? generateConversationId(),
    title: opts.title,
    model: opts.model,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

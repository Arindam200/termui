/**
 * termui/ai — AI provider hooks for streaming completions and chat.
 * Provider SDKs are loaded via dynamic import (optional peers).
 */

import { useState, useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AIProvider = 'anthropic' | 'openai' | 'ollama' | 'custom';

export interface TokenUsageStats {
  prompt: number;
  completion: number;
  total: number;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ─── useChat ──────────────────────────────────────────────────────────────────

export interface UseChatOptions {
  provider?: AIProvider;
  model?: string;
  apiKey?: string;
  baseURL?: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  /** Custom fetch function for 'custom' provider */
  fetchFn?: (messages: Message[]) => AsyncIterable<string>;
  onError?: (err: Error) => void;
}

export interface UseChatReturn {
  messages: Message[];
  sendMessage: (text: string) => Promise<void>;
  isStreaming: boolean;
  abort: () => void;
  error: Error | null;
  tokenUsage: TokenUsageStats | null;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  // messagesRef is the source of truth for history — updated synchronously so
  // sendMessage always sees the current list before React has re-rendered.
  // The messages state is derived from it and exists only to trigger re-renders.
  const messagesRef = useRef<Message[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsageStats | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const opts = optionsRef.current;
    const userMsg: Message = { role: 'user', content: text };

    // Update ref synchronously first so history is correct before any await.
    messagesRef.current = [...messagesRef.current, userMsg];
    setMessages(messagesRef.current);
    setError(null);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Build history from the ref — always accurate, no React scheduling involved.
      const history: Message[] = [];
      if (opts.systemPrompt) {
        history.push({ role: 'system', content: opts.systemPrompt });
      }
      history.push(...messagesRef.current);

      const stream = createStream(opts, history, controller.signal, setTokenUsage);

      // Append a placeholder assistant message synchronously via the ref.
      const assistantMsg: Message = { role: 'assistant', content: '' };
      messagesRef.current = [...messagesRef.current, assistantMsg];
      setMessages(messagesRef.current);

      let assistantContent = '';
      for await (const chunk of stream) {
        if (controller.signal.aborted) break;
        assistantContent += chunk;
        // Update the last (assistant) message in place via the ref.
        const updated = messagesRef.current.slice();
        updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
        messagesRef.current = updated;
        setMessages(messagesRef.current);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        opts.onError?.(error);
      }
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return { messages, sendMessage, isStreaming, abort, error, tokenUsage };
}

// ─── useCompletion ────────────────────────────────────────────────────────────

export interface UseCompletionOptions {
  provider?: AIProvider;
  model?: string;
  apiKey?: string;
  baseURL?: string;
  maxTokens?: number;
  temperature?: number;
  fetchFn?: (prompt: string) => AsyncIterable<string>;
  onError?: (err: Error) => void;
}

export interface UseCompletionReturn {
  text: string;
  complete: (prompt: string) => Promise<void>;
  isStreaming: boolean;
  abort: () => void;
  error: Error | null;
}

export function useCompletion(options: UseCompletionOptions = {}): UseCompletionReturn {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const complete = useCallback(async (prompt: string) => {
    const opts = optionsRef.current;
    setText('');
    setError(null);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      let stream: AsyncIterable<string>;
      if (opts.fetchFn) {
        stream = opts.fetchFn(prompt);
      } else {
        stream = await createStream(
          {
            provider: opts.provider,
            model: opts.model,
            apiKey: opts.apiKey,
            baseURL: opts.baseURL,
            maxTokens: opts.maxTokens,
            temperature: opts.temperature,
          },
          [{ role: 'user', content: prompt }],
          controller.signal
        );
      }

      let accumulated = '';
      for await (const chunk of stream) {
        if (controller.signal.aborted) break;
        accumulated += chunk;
        setText(accumulated);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        opts.onError?.(error);
      }
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return { text, complete, isStreaming, abort, error };
}

// ─── Provider stream factory ──────────────────────────────────────────────────

async function* createStream(
  opts: {
    provider?: AIProvider;
    model?: string;
    apiKey?: string;
    baseURL?: string;
    maxTokens?: number;
    temperature?: number;
    fetchFn?: (messages: Message[]) => AsyncIterable<string>;
  },
  messages: Message[],
  signal: AbortSignal,
  onUsage?: (usage: TokenUsageStats) => void
): AsyncIterable<string> {
  const provider = opts.provider ?? 'anthropic';

  if (opts.fetchFn) {
    yield* opts.fetchFn(messages);
    return;
  }

  if (provider === 'anthropic') {
    yield* streamAnthropic(opts, messages, signal, onUsage);
  } else if (provider === 'openai') {
    yield* streamOpenAI(opts, messages, signal, onUsage);
  } else if (provider === 'ollama') {
    yield* streamOllama(opts, messages, signal, onUsage);
  } else {
    throw new Error(`Unsupported provider: ${provider}. Use fetchFn for custom providers.`);
  }
}

async function* streamAnthropic(
  opts: {
    model?: string;
    apiKey?: string;
    maxTokens?: number;
    temperature?: number;
  },
  messages: Message[],
  signal: AbortSignal,
  onUsage?: (usage: TokenUsageStats) => void
): AsyncIterable<string> {
  // Use a variable so tsc does not try to statically resolve the module path,
  // avoiding TS2307 when @anthropic-ai/sdk is an optional peer not installed at
  // build time. The runtime import is unaffected.
  const sdkId = '@anthropic-ai/sdk';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { default: Anthropic } = await (import(sdkId) as Promise<any>).catch(() => {
    throw new Error('Anthropic SDK not found. Install it with: npm install @anthropic-ai/sdk');
  });

  const client = new Anthropic({ apiKey: opts.apiKey });
  const systemMessages = messages.filter((m) => m.role === 'system');
  const chatMessages = messages.filter((m) => m.role !== 'system');

  const stream = client.messages.stream({
    model: opts.model ?? 'claude-sonnet-4-6',
    max_tokens: opts.maxTokens ?? 4096,
    system: systemMessages.map((m) => m.content).join('\n') || undefined,
    messages: chatMessages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  });

  let inputTokens = 0;
  let outputTokens = 0;

  for await (const event of stream) {
    if (signal.aborted) break;
    if (event.type === 'message_start') {
      inputTokens = event.message?.usage?.input_tokens ?? 0;
    } else if (event.type === 'message_delta' && event.usage) {
      outputTokens = event.usage.output_tokens ?? 0;
    } else if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text;
    }
  }

  if (onUsage && (inputTokens || outputTokens)) {
    onUsage({ prompt: inputTokens, completion: outputTokens, total: inputTokens + outputTokens });
  }
}

async function* streamOpenAI(
  opts: {
    model?: string;
    apiKey?: string;
    baseURL?: string;
    maxTokens?: number;
    temperature?: number;
  },
  messages: Message[],
  signal: AbortSignal,
  onUsage?: (usage: TokenUsageStats) => void
): AsyncIterable<string> {
  const openaiId = 'openai';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { default: OpenAI } = await (import(openaiId) as Promise<any>).catch(() => {
    throw new Error('OpenAI SDK not found. Install it with: npm install openai');
  });

  const client = new OpenAI({ apiKey: opts.apiKey, baseURL: opts.baseURL });

  const stream = await client.chat.completions.create({
    model: opts.model ?? 'gpt-4o',
    max_tokens: opts.maxTokens,
    temperature: opts.temperature,
    messages: messages.map((m: Message) => ({ role: m.role, content: m.content })),
    stream: true,
    stream_options: onUsage ? { include_usage: true } : undefined,
  });

  for await (const chunk of stream) {
    if (signal.aborted) break;
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
    if (chunk.usage && onUsage) {
      onUsage({
        prompt: chunk.usage.prompt_tokens,
        completion: chunk.usage.completion_tokens,
        total: chunk.usage.total_tokens,
      });
    }
  }
}

async function* streamOllama(
  opts: {
    model?: string;
    baseURL?: string;
    maxTokens?: number;
    temperature?: number;
  },
  messages: Message[],
  signal: AbortSignal,
  onUsage?: (usage: TokenUsageStats) => void
): AsyncIterable<string> {
  const baseURL = opts.baseURL ?? 'http://localhost:11434';
  const response = await fetch(`${baseURL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: opts.model ?? 'llama3.2',
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
      options: {
        temperature: opts.temperature,
        num_predict: opts.maxTokens,
      },
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('No response body from Ollama');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done || signal.aborted) break;
      const text = decoder.decode(value, { stream: true });
      const lines = text.split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const json = JSON.parse(line) as {
            message?: { content?: string };
            done?: boolean;
            prompt_eval_count?: number;
            eval_count?: number;
          };
          if (json.message?.content) yield json.message.content;
          if (json.done) {
            if (onUsage && json.prompt_eval_count != null) {
              const p = json.prompt_eval_count;
              const c = json.eval_count ?? 0;
              onUsage({ prompt: p, completion: c, total: p + c });
            }
            return;
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

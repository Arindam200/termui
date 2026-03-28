/**
 * ai-assistant template — full-featured AI chat UI
 *
 * Wires together:
 *   • ChatThread + ChatMessage   — streaming conversation display
 *   • ToolApproval               — risk-gated tool call approval
 *   • ModelSelector              — interactive model switcher  (press m)
 *   • TokenUsage + ContextMeter  — live token / context status bar
 *   • ConversationStore          — auto-save / load conversations
 *   • useChat                    — streaming AI (swap provider below)
 *
 * Quick-start:
 *   ANTHROPIC_API_KEY=sk-… npx tsx src/index.tsx
 *
 * To use a real provider, edit the useChat options in <ChatApp>:
 *   provider: 'anthropic' | 'openai' | 'ollama'
 *   apiKey: process.env.ANTHROPIC_API_KEY
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { render, Box, Text, useApp } from 'ink';
import { ThemeProvider, useTheme, useInput } from '@termui/core';
import {
  ChatThread,
  ChatMessage,
  ToolApproval,
  ModelSelector,
  TokenUsage,
  ContextMeter,
  TextInput,
} from '@termui/components';
import type { ModelOption, RiskLevel } from '@termui/components';
import { useChat } from '@termui/adapters/ai';
import type { Message } from '@termui/adapters/ai';
import {
  createConversationStore,
  createConversation,
  generateConversationId,
} from '@termui/adapters/conversation-store';
import type { ConversationRecord } from '@termui/adapters/conversation-store';
import os from 'os';
import path from 'path';

// ─── Constants ────────────────────────────────────────────────────────────────

const CONTEXT_LIMIT = 200_000; // default context window size (tokens)

const MODELS: ModelOption[] = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4',   provider: 'Anthropic', context: 200_000 },
  { id: 'claude-opus-4-5',         name: 'Claude Opus 4.5',   provider: 'Anthropic', context: 200_000 },
  { id: 'claude-haiku-4-5',        name: 'Claude Haiku 4.5',  provider: 'Anthropic', context: 200_000 },
  { id: 'gpt-4o',                  name: 'GPT-4o',             provider: 'OpenAI',    context: 128_000 },
  { id: 'gpt-4o-mini',             name: 'GPT-4o Mini',        provider: 'OpenAI',    context: 128_000 },
  { id: 'llama3.2',                name: 'Llama 3.2',          provider: 'Ollama',    context:  32_000 },
];

// ─── Conversation store (persists to ~/.local/share/ai-assistant) ─────────────

const store = createConversationStore({
  dir: path.join(os.homedir(), '.local', 'share', 'ai-assistant'),
});

// ─── Mock streaming provider (replace with a real one) ───────────────────────

async function* mockStream(messages: Message[]): AsyncIterable<string> {
  const last = messages.filter((m) => m.role === 'user').pop()?.content ?? '';
  const reply =
    `Echo: "${last.slice(0, 60)}"\n\n` +
    `Replace the fetchFn in <ChatApp> with your provider:\n` +
    `  provider: 'anthropic', apiKey: process.env.ANTHROPIC_API_KEY\n\n` +
    `Press [m] to switch models, [s] to save, [n] for a new conversation.`;
  for (const char of reply) {
    await new Promise<void>((r) => setTimeout(r, 12));
    yield char;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type AppMode = 'chat' | 'model-select';

interface PendingTool {
  name: string;
  description: string;
  args: Record<string, unknown>;
  risk: RiskLevel;
  resolve: (approved: boolean) => void;
}

// ─── ChatApp ─────────────────────────────────────────────────────────────────

function ChatApp() {
  const theme = useTheme();
  const { exit } = useApp();

  // UI state
  const [mode, setMode] = useState<AppMode>('chat');
  const [inputValue, setInputValue] = useState('');
  const [pendingTool, setPendingTool] = useState<PendingTool | null>(null);
  const [statusMsg, setStatusMsg] = useState('');

  // Model selection
  const [selectedModel, setSelectedModel] = useState(MODELS[0]!.id);
  const selectedModelOption = MODELS.find((m) => m.id === selectedModel) ?? MODELS[0]!;

  // Conversation record (for persistence)
  const [conversation, setConversation] = useState<ConversationRecord>(() =>
    createConversation({ id: generateConversationId(), model: selectedModel })
  );
  const conversationRef = useRef(conversation);
  useEffect(() => { conversationRef.current = conversation; }, [conversation]);

  // Chat hook — swap provider + apiKey for real completions
  const { messages, sendMessage, isStreaming, abort, error, tokenUsage } = useChat({
    provider: 'custom',
    fetchFn: mockStream,
    // ── Real provider examples (uncomment + set env vars): ──
    // provider: 'anthropic',
    // model: selectedModel,
    // apiKey: process.env.ANTHROPIC_API_KEY,
    //
    // provider: 'openai',
    // model: selectedModel,
    // apiKey: process.env.OPENAI_API_KEY,
    //
    // provider: 'ollama',
    // model: selectedModel,
    // baseURL: 'http://localhost:11434',
  });

  // ── Auto-save conversation after each exchange ──────────────────────────────
  useEffect(() => {
    if (messages.length === 0) return;
    const updated: ConversationRecord = {
      ...conversationRef.current,
      model: selectedModel,
      messages: messages.map((m) => ({ ...m, timestamp: new Date().toISOString() })),
      updatedAt: new Date().toISOString(),
    };
    setConversation(updated);
    store.save(updated).catch(() => {});
  }, [messages, selectedModel]);

  // ── Tool approval skeleton ──────────────────────────────────────────────────
  // In a real tool-calling setup, your AI provider callback would call `requestTool`
  // and await the returned Promise. Approval fires onApprove; denial fires onDeny.
  const requestTool = useCallback(
    (tool: Omit<PendingTool, 'resolve'>): Promise<boolean> =>
      new Promise((resolve) => {
        setPendingTool({ ...tool, resolve });
      }),
    []
  );

  // Demo: show a tool approval prompt when user types "/demo-tool"
  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;
      setInputValue('');

      if (text.trim() === '/demo-tool') {
        const approved = await requestTool({
          name: 'read_file',
          description: 'Read the contents of a local file.',
          args: { path: '~/Documents/notes.md' },
          risk: 'medium',
        });
        setStatusMsg(approved ? 'Tool approved — executing...' : 'Tool denied.');
        setTimeout(() => setStatusMsg(''), 3000);
        return;
      }

      if (text.trim() === '/new') {
        const fresh = createConversation({ id: generateConversationId(), model: selectedModel });
        setConversation(fresh);
        setStatusMsg('New conversation started.');
        setTimeout(() => setStatusMsg(''), 2000);
        return;
      }

      await sendMessage(text);
    },
    [isStreaming, sendMessage, requestTool, selectedModel]
  );

  // ── Keybindings ─────────────────────────────────────────────────────────────
  useInput((char, key) => {
    if (key.ctrl && char === 'c') { exit(); return; }

    if (mode === 'model-select') {
      if (key.escape) setMode('chat');
      return; // ModelSelector handles ↑ ↓ Enter internally
    }

    if (mode === 'chat' && !pendingTool) {
      if (char === 'm' && !isStreaming && inputValue === '') {
        setMode('model-select');
        return;
      }
      if (key.ctrl && char === 'a') { abort(); return; }
      if (key.ctrl && char === 's') {
        store.save({ ...conversationRef.current, updatedAt: new Date().toISOString() })
          .then(() => { setStatusMsg('Saved.'); setTimeout(() => setStatusMsg(''), 2000); })
          .catch(() => {});
        return;
      }
    }
  });

  const visibleMessages = messages.filter((m) => m.role !== 'system');
  const contextUsed = tokenUsage?.total ?? 0;
  const contextLimit = MODELS.find((m) => m.id === selectedModel)?.context ?? CONTEXT_LIMIT;

  return (
    <Box flexDirection="column" height={process.stdout.rows ?? 24}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box
        borderStyle="single"
        borderColor={theme.colors.border}
        paddingX={1}
        justifyContent="space-between"
      >
        <Text bold color={theme.colors.primary}>AI Assistant</Text>
        <Box gap={2}>
          <Text color={theme.colors.accent}>{selectedModelOption.name}</Text>
          <Text color={theme.colors.mutedForeground} dimColor>
            [m] model  [^A] abort  [^S] save  [^C] quit
          </Text>
        </Box>
      </Box>

      {/* ── Messages ───────────────────────────────────────────────────────── */}
      <Box flexGrow={1} flexDirection="column" paddingX={1} paddingTop={1} overflow="hidden">
        {mode === 'model-select' ? (
          /* ── Model selector overlay ─────────────────────────────────────── */
          <Box
            flexDirection="column"
            borderStyle="round"
            borderColor={theme.colors.primary}
            paddingX={2}
            paddingY={1}
          >
            <Text bold color={theme.colors.primary} dimColor={false}>
              Select Model  <Text dimColor>[↑↓ navigate · Enter select · Esc cancel]</Text>
            </Text>
            <Box marginTop={1}>
              <ModelSelector
                models={MODELS}
                selected={selectedModel}
                onSelect={(id) => {
                  setSelectedModel(id);
                  setMode('chat');
                }}
                groupByProvider
                showContext
              />
            </Box>
          </Box>
        ) : pendingTool ? (
          /* ── Tool approval overlay ──────────────────────────────────────── */
          <ToolApproval
            name={pendingTool.name}
            description={pendingTool.description}
            args={pendingTool.args}
            risk={pendingTool.risk}
            timeout={30}
            onApprove={() => { pendingTool.resolve(true);  setPendingTool(null); }}
            onDeny={()    => { pendingTool.resolve(false); setPendingTool(null); }}
            onAlwaysAllow={() => { pendingTool.resolve(true); setPendingTool(null); }}
          />
        ) : (
          /* ── Conversation thread ────────────────────────────────────────── */
          <ChatThread autoScroll>
            {visibleMessages.length === 0 ? (
              <Box flexDirection="column" alignItems="center" paddingTop={2}>
                <Text color={theme.colors.mutedForeground}>Start chatting below.</Text>
                <Text color={theme.colors.mutedForeground} dimColor>
                  Type /demo-tool to see ToolApproval · /new to start fresh
                </Text>
              </Box>
            ) : (
              visibleMessages.map((msg, i) => {
                const isLast = i === visibleMessages.length - 1;
                const isStreaming_ = isStreaming && isLast && msg.role === 'assistant';
                return (
                  <ChatMessage
                    key={i}
                    role={msg.role as 'user' | 'assistant'}
                    streaming={isStreaming_}
                    showSeparator={i > 0}
                  >
                    {msg.content}
                  </ChatMessage>
                );
              })
            )}
          </ChatThread>
        )}
      </Box>

      {/* ── Error banner ───────────────────────────────────────────────────── */}
      {error && (
        <Box paddingX={2}>
          <Text color={theme.colors.error ?? 'red'}>Error: {error.message}</Text>
        </Box>
      )}

      {/* ── Status flash ───────────────────────────────────────────────────── */}
      {statusMsg && (
        <Box paddingX={2}>
          <Text color={theme.colors.success ?? 'green'}>{statusMsg}</Text>
        </Box>
      )}

      {/* ── Input ──────────────────────────────────────────────────────────── */}
      {mode === 'chat' && !pendingTool && (
        <Box paddingX={1} paddingBottom={0}>
          <TextInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={(val) => void handleSend(val)}
            placeholder={isStreaming ? 'Streaming… (^A to abort)' : 'Message… (/demo-tool /new)'}
            width={Math.min((process.stdout.columns ?? 80) - 4, 100)}
            autoFocus
            bordered
            borderStyle="round"
          />
        </Box>
      )}

      {/* ── Status bar: token usage + context meter ────────────────────────── */}
      <Box paddingX={2} paddingBottom={0} gap={2}>
        {tokenUsage ? (
          <TokenUsage
            prompt={tokenUsage.prompt}
            completion={tokenUsage.completion}
            model={selectedModelOption.name}
            showCost
          />
        ) : (
          <Text color={theme.colors.mutedForeground} dimColor>
            {visibleMessages.length} messages
          </Text>
        )}
        {contextUsed > 0 && (
          <ContextMeter
            used={contextUsed}
            limit={contextLimit}
            label="ctx"
            width={16}
            warnAt={75}
            criticalAt={90}
          />
        )}
      </Box>

    </Box>
  );
}

// ─── Entry point ─────────────────────────────────────────────────────────────

render(
  <ThemeProvider>
    <ChatApp />
  </ThemeProvider>
);

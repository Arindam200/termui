/**
 * TermUI AI Components Demo — v1.2.0
 *
 * 6 interactive tabs covering every AI component and both streaming hooks.
 *
 *   [1] Chat    — ChatThread, ChatMessage (all roles, streaming, collapsible)
 *   [2] Tools   — ToolCall (4 statuses), ToolApproval (3 risk levels)
 *   [3] Model   — ModelSelector (grouped by provider), ThinkingBlock
 *   [4] Tokens  — TokenUsage (with cost), ContextMeter (3 fill levels)
 *   [5] Files   — FileChange (modify / create / delete with diffs)
 *   [6] Live    — useChat + useCompletion with mock streaming
 *
 * Press ←/→ to switch tabs · Esc to quit
 *
 * Live Chat uses a built-in mock by default. To test a real provider,
 * edit the LiveChatTab and swap the fetchFn for a provider config:
 *   provider: 'ollama', model: 'llama3.2'       (Ollama must be running)
 *   provider: 'anthropic', apiKey: process.env.ANTHROPIC_API_KEY
 *   provider: 'openai',    apiKey: process.env.OPENAI_API_KEY
 */
import React, { useState } from 'react';
import { render, Box, Text, useApp, useInput } from 'ink';
import { ThemeProvider } from 'termui';
import {
  // Layout / data
  Tabs,
  Stack,
  Panel,
  Divider,
  Badge,
  // Feedback
  Spinner,
  Alert,
  // Input
  TextInput,
  // AI components
  ChatMessage,
  ChatThread,
  ToolCall,
  ToolApproval,
  ModelSelector,
  ThinkingBlock,
  TokenUsage,
  ContextMeter,
  FileChange,
  StreamOutput,
  ConversationHistory,
  ErrorRetry,
} from 'termui/components';
import { useChat, useCompletion } from 'termui/ai';
import type { Message } from 'termui/ai';

// ─── Mock streaming providers ─────────────────────────────────────────────────

async function* mockChatStream(messages: Message[]): AsyncIterable<string> {
  const last = messages.filter((m) => m.role === 'user').pop()?.content ?? '';
  const reply =
    `I received: "${last.slice(0, 40)}${last.length > 40 ? '…' : ''}". ` +
    `This is mock streaming via useChat. Each character arrives with a small ` +
    `delay to simulate a real provider. Replace fetchFn with ` +
    `provider: 'ollama' (or 'anthropic' / 'openai') to use a live model.`;
  for (const char of reply) {
    await new Promise<void>((r) => setTimeout(r, 14));
    yield char;
  }
}

async function* mockCompletionStream(prompt: string): AsyncIterable<string> {
  const reply =
    `Completion for "${prompt.slice(0, 30)}…" — ` +
    `useCompletion streams single-turn responses. No history is maintained. ` +
    `Swap fetchFn for a real provider to get actual inference output.`;
  for (const char of reply) {
    await new Promise<void>((r) => setTimeout(r, 12));
    yield char;
  }
}

// ─── Shared constants ─────────────────────────────────────────────────────────

const NOW = new Date();

const MODEL_LIST = [
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'Anthropic', context: 200000 },
  { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', provider: 'Anthropic', context: 200000 },
  { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', provider: 'Anthropic', context: 200000 },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', context: 128000 },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini', provider: 'OpenAI', context: 128000 },
  { id: 'llama3.2', name: 'Llama 3.2', provider: 'Ollama', context: 131072 },
  { id: 'gemma3', name: 'Gemma 3', provider: 'Ollama', context: 131072 },
];

const THINKING_CONTENT = `Let me reason through this step by step.

1. The user is asking about building a terminal UI with streaming AI responses.
2. Key constraints: character-grid layout, ANSI color support, no DOM.
3. TermUI's ChatMessage component handles both static and streaming content.
   - Pass streaming={true} with empty children → animated dots indicator.
   - Pass streaming={true} with children → shows content as it accumulates.
4. Wrap messages in ChatThread for proper vertical stacking.
5. Pair with useChat hook which manages message history and streaming state.

Conclusion: The cleanest pattern is to map the messages array from useChat,
setting streaming=true only on the last assistant message while isStreaming.`;

const FILE_CHANGES = [
  {
    path: 'src/components/Button.tsx',
    type: 'modify' as const,
    diff: `--- a/src/components/Button.tsx
+++ b/src/components/Button.tsx
@@ -1,7 +1,9 @@
 import React from 'react';
-import { Box, Text } from 'ink';
+import { Box, Text, useInput } from 'ink';

 export function Button({ label, onClick }: ButtonProps) {
+  useInput((input) => { if (input === 'return') onClick?.(); });
+
   return (
     <Box borderStyle="round" paddingX={1}>
       <Text bold>{label}</Text>`,
  },
  {
    path: 'src/hooks/useDebounce.ts',
    type: 'create' as const,
    content: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}`,
  },
  {
    path: 'src/legacy/OldAuth.tsx',
    type: 'delete' as const,
  },
];

// ─── Tab 1: Chat ──────────────────────────────────────────────────────────────

function ChatTab() {
  return (
    <Stack direction="vertical" gap={1}>
      <Panel title="ChatThread + ChatMessage — All Roles">
        <ChatThread>
          <ChatMessage role="system" timestamp={NOW}>
            <Text>You are a helpful terminal UI assistant. Be concise and direct.</Text>
          </ChatMessage>
          <ChatMessage role="user" timestamp={NOW}>
            <Text>How do I add a streaming progress indicator to my CLI?</Text>
          </ChatMessage>
          <ChatMessage role="assistant" timestamp={NOW}>
            <Text wrap="wrap">
              {'Use <Spinner style="dots" /> from termui/components while waiting,\n' +
                'then swap to <ProgressBar value={done} total={total} /> once you have\n' +
                'a measurable task. Both are theme-aware and animate automatically.'}
            </Text>
          </ChatMessage>
          <ChatMessage role="error">
            <Text>Connection timeout — Ollama may not be running on :11434</Text>
          </ChatMessage>
        </ChatThread>
      </Panel>

      <Panel title="Streaming State — animated dots when content is empty">
        <ChatThread>
          <ChatMessage role="user">
            <Text>What models does Ollama support?</Text>
          </ChatMessage>
          {/* No children → ChatMessage shows animated dots while streaming=true */}
          <ChatMessage role="assistant" streaming={true} />
        </ChatThread>
      </Panel>

      <Panel title="Collapsible Message — Press Enter or Space to toggle">
        <ChatThread>
          <ChatMessage role="assistant" collapsed={true}>
            <Text wrap="wrap">
              {'This long response has been collapsed to save screen space.\n' +
                'Line 2: TermUI ChatMessage supports initialCollapsed via the collapsed prop.\n' +
                'Line 3: The first 60 chars of the first line appear as a preview.\n' +
                'Line 4: Pressing Enter or Space expands the full content.'}
            </Text>
          </ChatMessage>
        </ChatThread>
      </Panel>
    </Stack>
  );
}

// ─── Tab 2: Tools ─────────────────────────────────────────────────────────────

type RiskLevel = 'low' | 'medium' | 'high';
type ApprovalState = 'pending' | 'approved' | 'denied' | 'always';

const RISK_CYCLE: RiskLevel[] = ['low', 'medium', 'high'];

function ToolsTab() {
  const [risk, setRisk] = useState<RiskLevel>('low');
  const [approval, setApproval] = useState<ApprovalState>('pending');

  const cycleRisk = () => {
    const next = RISK_CYCLE[(RISK_CYCLE.indexOf(risk) + 1) % RISK_CYCLE.length]!;
    setRisk(next);
    setApproval('pending');
  };

  useInput((input) => {
    if (input === 'r' || input === 'R') cycleRisk();
  });

  return (
    <Stack direction="vertical" gap={1}>
      <Panel title="ToolCall — 4 Statuses  (Space / Enter to expand args & result)">
        <Stack direction="vertical" gap={0}>
          <ToolCall name="read_file" status="pending" args={{ path: '/etc/hosts' }} />
          <ToolCall
            name="list_directory"
            status="running"
            args={{ path: '/usr/local/bin', recursive: false }}
          />
          <ToolCall
            name="write_file"
            status="success"
            args={{ path: 'output.json', content: '{"ok":true}' }}
            result="File written: 42 bytes"
            duration={128}
            defaultCollapsed={false}
          />
          <ToolCall
            name="exec_command"
            status="error"
            args={{ cmd: 'rm -rf /important-dir' }}
            result="Error: EACCES: permission denied"
            duration={11}
            defaultCollapsed={false}
          />
        </Stack>
      </Panel>

      <Divider
        label={`ToolApproval — ${risk.toUpperCase()} risk  ·  [r] cycle risk  ·  [y] approve  [n] deny  [a] always allow`}
      />

      {approval === 'pending' ? (
        <ToolApproval
          name="drop_table"
          description="Permanently deletes all rows from the users table"
          args={{ table: 'users', cascade: true, confirm: 'DELETE_EVERYTHING' }}
          risk={risk}
          onApprove={() => setApproval('approved')}
          onDeny={() => setApproval('denied')}
          onAlwaysAllow={() => setApproval('always')}
          timeout={risk === 'high' ? 10 : undefined}
        />
      ) : (
        <Box gap={2} alignItems="center">
          <Badge variant={approval === 'approved' || approval === 'always' ? 'success' : 'error'}>
            {approval === 'approved'
              ? '✓ Approved'
              : approval === 'always'
                ? '✓ Always Allow'
                : '✗ Denied'}
          </Badge>
          <Text dimColor>Press r to reset with the next risk level</Text>
        </Box>
      )}
    </Stack>
  );
}

// ─── Tab 3: Model + Thinking ──────────────────────────────────────────────────

function ModelTab() {
  const [selected, setSelected] = useState('claude-sonnet-4-6');

  return (
    <Stack direction="vertical" gap={1}>
      <Box gap={2}>
        <Box flexDirection="column" flexGrow={1}>
          <Panel title="ModelSelector — Grouped by provider  (↑↓ navigate · Enter select)">
            <ModelSelector
              models={MODEL_LIST}
              selected={selected}
              onSelect={setSelected}
              groupByProvider={true}
              showContext={true}
              showProvider={false}
            />
          </Panel>
        </Box>
        <Box flexDirection="column" width={26}>
          <Panel title="Active Model">
            <Stack direction="vertical" gap={0}>
              <Text bold color="#7C3AED">
                {MODEL_LIST.find((m) => m.id === selected)?.name ?? selected}
              </Text>
              <Text dimColor>{MODEL_LIST.find((m) => m.id === selected)?.provider}</Text>
              <Text dimColor>
                {((MODEL_LIST.find((m) => m.id === selected)?.context ?? 0) / 1000).toFixed(0)}k ctx
              </Text>
            </Stack>
          </Panel>
        </Box>
      </Box>

      <Panel title="ThinkingBlock — Press Enter or Space to expand / collapse">
        <Stack direction="vertical" gap={1}>
          <ThinkingBlock
            content={THINKING_CONTENT}
            tokenCount={312}
            duration={2400}
            defaultCollapsed={true}
          />
          <ThinkingBlock
            content="Analysing the request and considering edge cases..."
            streaming={true}
            defaultCollapsed={false}
          />
        </Stack>
      </Panel>
    </Stack>
  );
}

// ─── Tab 4: Tokens ────────────────────────────────────────────────────────────

function TokensTab() {
  return (
    <Stack direction="vertical" gap={1}>
      <Panel title="TokenUsage — Compact badge with optional cost estimation">
        <Stack direction="vertical" gap={0}>
          <TokenUsage prompt={1240} completion={380} model="claude-3-5-sonnet" showCost />
          <TokenUsage prompt={8500} completion={1200} model="gpt-4o" showCost />
          <TokenUsage prompt={42000} completion={8700} model="gpt-4o-mini" showCost />
          <TokenUsage prompt={125000} completion={32000} model="claude-3-opus" showCost />
          <TokenUsage prompt={512} completion={128} />
        </Stack>
      </Panel>

      <Panel title="ContextMeter — Visual bar with warn / critical thresholds">
        <Stack direction="vertical" gap={1}>
          <ContextMeter used={18000} limit={200000} label="claude-sonnet (low) " width={24} />
          <ContextMeter used={152000} limit={200000} label="claude-sonnet (warn)" width={24} />
          <ContextMeter used={188000} limit={200000} label="claude-sonnet (crit)" width={24} />
          <ContextMeter
            used={65536}
            limit={131072}
            label="ollama/llama3.2     "
            width={24}
            warnAt={70}
            criticalAt={85}
          />
        </Stack>
      </Panel>
    </Stack>
  );
}

// ─── Tab 5: Files ─────────────────────────────────────────────────────────────

function FilesTab() {
  const [log, setLog] = useState<string[]>([]);

  return (
    <Stack direction="vertical" gap={1}>
      <FileChange
        changes={FILE_CHANGES}
        onAccept={(path) => setLog((l) => [...l, `✓ accepted  ${path}`])}
        onReject={(path) => setLog((l) => [...l, `✗ rejected  ${path}`])}
        onAcceptAll={() => setLog((l) => [...l, '✓ accepted all changes'])}
      />
      {log.length > 0 && (
        <Panel title="Action Log">
          <Stack direction="vertical" gap={0}>
            {log.map((entry, i) => (
              <Text key={i} dimColor>
                {entry}
              </Text>
            ))}
          </Stack>
        </Panel>
      )}
    </Stack>
  );
}

// ─── Tab 6: Live ──────────────────────────────────────────────────────────────

function LiveChatTab() {
  const [chatInput, setChatInput] = useState('');
  const [completionInput, setCompletionInput] = useState('');

  // ── useChat ──
  // Default: mock streaming (no provider needed).
  // Swap to a real provider by replacing the options below:
  //   { provider: 'ollama',    model: 'llama3.2' }
  //   { provider: 'anthropic', apiKey: process.env.ANTHROPIC_API_KEY }
  //   { provider: 'openai',    apiKey: process.env.OPENAI_API_KEY }
  const {
    messages,
    sendMessage,
    isStreaming,
    error: chatError,
    tokenUsage,
  } = useChat({
    provider: 'custom',
    fetchFn: mockChatStream,
    systemPrompt: 'You are a helpful TermUI demo assistant.',
  });

  // ── useCompletion ──
  const {
    text: completionText,
    complete,
    isStreaming: isCompleting,
    error: completionError,
  } = useCompletion({
    provider: 'custom',
    fetchFn: mockCompletionStream,
  });

  return (
    <Stack direction="vertical" gap={1}>
      {/* ── useChat panel ── */}
      <Panel title="useChat — Multi-turn streaming chat  (type + Enter to send)">
        <Stack direction="vertical" gap={1}>
          {messages.length === 0 ? (
            <Text dimColor>No messages yet. Type below and press Enter.</Text>
          ) : (
            <ChatThread>
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  role={msg.role}
                  streaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
                >
                  {/* Empty string is falsy → streaming dots show; non-empty → wrapped in Text */}
                  {msg.content ? <Text wrap="wrap">{msg.content}</Text> : undefined}
                </ChatMessage>
              ))}
            </ChatThread>
          )}

          <Box gap={1} alignItems="center">
            {isStreaming && <Spinner style="dots" />}
            <Box flexGrow={1}>
              <TextInput
                value={chatInput}
                onChange={setChatInput}
                onSubmit={(val) => {
                  if (!val.trim() || isStreaming) return;
                  setChatInput('');
                  void sendMessage(val);
                }}
                placeholder={isStreaming ? 'Streaming…' : 'Message (Enter to send)'}
                width={52}
                autoFocus
              />
            </Box>
          </Box>

          {chatError && (
            <Alert variant="error" title="Chat Error">
              {chatError.message}
            </Alert>
          )}
          {tokenUsage && (
            <TokenUsage prompt={tokenUsage.prompt} completion={tokenUsage.completion} />
          )}
        </Stack>
      </Panel>

      {/* ── useCompletion panel ── */}
      <Panel title="useCompletion — Single-prompt streaming  (type + Enter)">
        <Stack direction="vertical" gap={1}>
          <Box gap={1} alignItems="center">
            {isCompleting && <Spinner style="arc" />}
            <TextInput
              value={completionInput}
              onChange={setCompletionInput}
              onSubmit={(val) => {
                if (!val.trim() || isCompleting) return;
                setCompletionInput('');
                void complete(val);
              }}
              placeholder={isCompleting ? 'Streaming…' : 'Enter a prompt (Enter)'}
              width={52}
            />
          </Box>

          {completionText && (
            <Box borderStyle="single" paddingX={1}>
              <Text wrap="wrap">{completionText}</Text>
            </Box>
          )}

          {completionError && (
            <Alert variant="error" title="Completion Error">
              {completionError.message}
            </Alert>
          )}
        </Stack>
      </Panel>
    </Stack>
  );
}

// ─── Tab 7: New Components ────────────────────────────────────────────────────

async function* slowStream(text: string, delayMs = 20): AsyncIterable<string> {
  for (const char of text) {
    await new Promise<void>((r) => setTimeout(r, delayMs));
    yield char;
  }
}

const STREAM_TEXT =
  'StreamOutput wraps StreamingText with an optional label. ' +
  'It accepts either a pre-buffered string (animated char-by-char) ' +
  'or a real AsyncIterable<string> from an LLM SDK.';

const HISTORY_MESSAGES = [
  { role: 'user' as const, content: 'What is TermUI?' },
  {
    role: 'assistant' as const,
    content:
      'TermUI is a TypeScript terminal UI framework built on React/Ink. It provides 100+ components, 12 hooks, 8 themes, and a shadcn-style CLI for adding components to any Node.js project.',
  },
  { role: 'user' as const, content: 'Does it support streaming?' },
  {
    role: 'assistant' as const,
    content:
      'Yes — ChatMessage accepts a stream prop (AsyncIterable<string>) or streamText for animated playback. The new StreamOutput component is a standalone alternative that wraps StreamingText directly.',
  },
  { role: 'user' as const, content: 'How do I install a component?' },
  {
    role: 'assistant' as const,
    content:
      'Run: npx termui add <component-name>\nTermUI copies the source file into ./components/ui/ so you own the code.',
  },
];

function NewComponentsTab() {
  const [retryCount, setRetryCount] = useState(0);
  const [showError, setShowError] = useState(true);
  const [streamKey, setStreamKey] = useState(0);

  return (
    <Stack direction="vertical" gap={1}>
      {/* StreamOutput */}
      <Panel title="StreamOutput — standalone streaming display  [r] restart">
        <Stack direction="vertical" gap={1}>
          <StreamOutput
            key={`text-${streamKey}`}
            text={STREAM_TEXT}
            label="Response"
            speed={18}
            cursor
          />
          <StreamOutput
            key={`stream-${streamKey}`}
            stream={slowStream(
              'Streaming from AsyncIterable<string> — each chunk arrives asynchronously, just like a real LLM SDK response.',
              22
            )}
            label="Live stream"
            cursor
          />
        </Stack>
      </Panel>

      {/* ConversationHistory */}
      <Panel title="ConversationHistory — scrollable ↑↓ (maxHeight=6 rows shown)">
        <ConversationHistory maxHeight={6} showScrollHint isActive>
          {HISTORY_MESSAGES.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} showSeparator={i > 0}>
              <Text wrap="wrap">{msg.content}</Text>
            </ChatMessage>
          ))}
        </ConversationHistory>
      </Panel>

      {/* ErrorRetry */}
      <Panel title={`ErrorRetry — retry affordance  (retryCount: ${retryCount}/3)`}>
        {showError ? (
          <ErrorRetry
            error={new Error('Connection refused: Ollama is not running on localhost:11434')}
            retryCount={retryCount}
            maxRetries={3}
            onRetry={() => {
              if (retryCount < 3) setRetryCount((c) => c + 1);
            }}
            onDismiss={() => setShowError(false)}
          />
        ) : (
          <Box gap={2}>
            <Text dimColor>Dismissed.</Text>
            <Text
              color="#7C3AED"
              onPress={() => {
                setShowError(true);
                setRetryCount(0);
              }}
            >
              [reset]
            </Text>
          </Box>
        )}
      </Panel>

      <Text dimColor> [r] restart streams</Text>
    </Stack>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

function Demo() {
  const { exit } = useApp();
  const [activeTab, setActiveTab] = useState('chat');

  useInput((_input, key) => {
    if (key.escape) exit();
  });

  const tabs = [
    { key: 'chat', label: 'Chat', content: <ChatTab /> },
    { key: 'tools', label: 'Tools', content: <ToolsTab /> },
    { key: 'model', label: 'Model', content: <ModelTab /> },
    { key: 'tokens', label: 'Tokens', content: <TokensTab /> },
    { key: 'files', label: 'Files', content: <FilesTab /> },
    { key: 'live', label: 'Live', content: <LiveChatTab /> },
    { key: 'new', label: 'New ✦', content: <NewComponentsTab /> },
  ];

  return (
    <Box flexDirection="column" gap={1} padding={1}>
      <Box borderStyle="round" borderColor="#7C3AED" paddingX={2}>
        <Text bold color="#7C3AED">
          ◆ TermUI AI Demo — v1.2.0
        </Text>
        <Text color="gray"> ←/→ tabs · Esc quit</Text>
      </Box>

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Demo />
    </ThemeProvider>
  );
}

render(<App />);

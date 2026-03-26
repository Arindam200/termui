---
title: 'AI Components'
---

# AI Components

Specialized components and hooks for building AI-powered CLI applications. These primitives handle the common patterns you need when integrating LLMs into terminal tools: streaming chat, tool execution, reasoning display, file diffs, and more.

## Installation

Add individual components with the `termui add` command:

```sh
npx termui add chat-message chat-thread tool-call thinking-block \
  token-usage context-meter tool-approval model-selector file-change
```

The AI adapter hooks ship in a separate package:

```sh
npm install @termui/adapters
# plus at least one provider SDK
npm install @anthropic-ai/sdk   # for Anthropic
npm install openai               # for OpenAI
# Ollama needs no extra SDK — it uses fetch
```

---

## `ChatMessage`

Renders a single message in a conversation. Handles user, assistant, system, and error roles with distinct colour coding. Supports a live streaming state (animated dots while the model is typing) and a collapsible mode for long messages.

**Props:**

| Prop        | Type                                           | Default    | Required |
| ----------- | ---------------------------------------------- | ---------- | -------- |
| `role`      | `'user' \| 'assistant' \| 'system' \| 'error'` | —          | ✓        |
| `name`      | `string`                                       | role label | —        |
| `timestamp` | `Date`                                         | —          | —        |
| `streaming` | `boolean`                                      | `false`    | —        |
| `collapsed` | `boolean`                                      | `false`    | —        |
| `children`  | `ReactNode`                                    | —          | —        |

When `streaming` is `true` and `children` is empty, an animated `●●●` indicator is shown. When `collapsed` is `true` the message body is truncated to the first 60 characters and the user can press `Enter` or `Space` to expand.

**Usage:**

```tsx
import { ChatMessage } from 'termui/components';

// User turn
<ChatMessage role="user" timestamp={new Date()}>
  Explain how React Server Components work.
</ChatMessage>

// Assistant reply — live while streaming
<ChatMessage role="assistant" streaming={isStreaming}>
  {partialText}
</ChatMessage>

// System instruction (dimmed)
<ChatMessage role="system">
  You are a helpful CLI assistant.
</ChatMessage>

// Error state
<ChatMessage role="error">
  Rate limit exceeded. Retry in 30s.
</ChatMessage>
```

---

## `ChatThread`

A container that stacks `ChatMessage` children in a scrollable column. In Ink's rendering model the latest content naturally appears at the bottom.

**Props:**

| Prop         | Type        | Default | Required |
| ------------ | ----------- | ------- | -------- |
| `maxHeight`  | `number`    | —       | —        |
| `autoScroll` | `boolean`   | `true`  | —        |
| `children`   | `ReactNode` | —       | —        |

`maxHeight` clips the visible area to that many terminal rows. `autoScroll` is accepted for API compatibility and future enhancement.

**Usage:**

```tsx
import { ChatThread, ChatMessage } from 'termui/components';

<ChatThread maxHeight={20}>
  {messages.map((msg) => (
    <ChatMessage key={msg.id} role={msg.role}>
      {msg.content}
    </ChatMessage>
  ))}
</ChatThread>;
```

---

## `ToolCall`

Displays a single tool invocation with its current status, optional arguments, result, and elapsed time. Collapsible by default so long argument lists don't overwhelm the screen.

**Props:**

| Prop               | Type                                             | Default | Required |
| ------------------ | ------------------------------------------------ | ------- | -------- |
| `name`             | `string`                                         | —       | ✓        |
| `status`           | `'pending' \| 'running' \| 'success' \| 'error'` | —       | ✓        |
| `args`             | `Record<string, unknown>`                        | —       | —        |
| `result`           | `unknown`                                        | —       | —        |
| `duration`         | `number`                                         | —       | —        |
| `collapsible`      | `boolean`                                        | `true`  | —        |
| `defaultCollapsed` | `boolean`                                        | `true`  | —        |

While `status` is `'running'` and `duration` is not provided, a live elapsed timer is displayed. Press `Enter` or `Space` to toggle the expanded args/result view.

**Usage:**

```tsx
import { ToolCall } from 'termui/components';

// Running — shows spinner + live timer
<ToolCall name="read_file" status="running" args={{ path: 'src/index.ts' }} />

// Completed
<ToolCall
  name="read_file"
  status="success"
  args={{ path: 'src/index.ts' }}
  result="import React from 'react';\n..."
  duration={42}
/>

// Failed
<ToolCall name="bash" status="error" args={{ cmd: 'rm -rf /' }} result="Permission denied" />
```

---

## `ThinkingBlock`

Shows an extended thinking / reasoning trace from a model. Collapsed by default with a toggle header. Displays token count and duration metadata when provided. Press `Enter` or `Space` to expand.

**Props:**

| Prop               | Type      | Default       | Required |
| ------------------ | --------- | ------------- | -------- |
| `content`          | `string`  | —             | ✓        |
| `streaming`        | `boolean` | `false`       | —        |
| `defaultCollapsed` | `boolean` | `true`        | —        |
| `label`            | `string`  | `'Reasoning'` | —        |
| `tokenCount`       | `number`  | —             | —        |
| `duration`         | `number`  | —             | —        |

When `streaming` is `true` the header text reads `"Thinking..."` in the primary theme colour. `duration` is expected in milliseconds and is displayed as seconds (e.g. `3.2s`).

**Usage:**

```tsx
import { ThinkingBlock } from 'termui/components';

<ThinkingBlock content={thinkingText} tokenCount={1240} duration={3200} label="Reasoning" />;
```

---

## `TokenUsage` and `ContextMeter`

### `TokenUsage`

Compact inline display of prompt / completion token counts, optional model name, and an optional cost estimate based on approximate public pricing for common models.

**Props:**

| Prop         | Type      | Default | Required |
| ------------ | --------- | ------- | -------- |
| `prompt`     | `number`  | —       | ✓        |
| `completion` | `number`  | —       | ✓        |
| `model`      | `string`  | —       | —        |
| `showCost`   | `boolean` | `false` | —        |

Built-in cost estimates are available for `claude-3-5-sonnet`, `claude-3-5-haiku`, `claude-3-opus`, `gpt-4o`, `gpt-4o-mini`, and `gpt-4-turbo`. Matching is substring-based, so `"claude-3-5-sonnet-20241022"` resolves correctly.

**Usage:**

```tsx
import { TokenUsage } from 'termui/components';

<TokenUsage prompt={1024} completion={312} model="claude-3-5-sonnet" showCost />;
// Renders: ⟨ 1.0k in / 312 out · claude-3-5-sonnet · $0.0078 ⟩
```

---

### `ContextMeter`

A horizontal progress bar that visualises how much of the model's context window has been consumed. Colour shifts from green to yellow to red as usage climbs.

**Props:**

| Prop          | Type      | Default | Required |
| ------------- | --------- | ------- | -------- |
| `used`        | `number`  | —       | ✓        |
| `limit`       | `number`  | —       | ✓        |
| `label`       | `string`  | —       | —        |
| `showPercent` | `boolean` | `true`  | —        |
| `warnAt`      | `number`  | `75`    | —        |
| `criticalAt`  | `number`  | `90`    | —        |
| `width`       | `number`  | `20`    | —        |

`warnAt` and `criticalAt` are percentage thresholds. `width` controls the character width of the filled bar.

**Usage:**

```tsx
import { ContextMeter } from 'termui/components';

<ContextMeter label="Context" used={tokenUsage.total} limit={200000} warnAt={75} criticalAt={90} />;
```

---

## `ToolApproval`

An interactive approval dialog rendered when an AI agent requests permission to run a tool. Colour-coded by risk level. Accepts keyboard inputs: `y` approve, `n` deny, `a` always allow. An optional countdown auto-denies after a configurable timeout.

**Props:**

| Prop            | Type                          | Default | Required |
| --------------- | ----------------------------- | ------- | -------- |
| `name`          | `string`                      | —       | ✓        |
| `onApprove`     | `() => void`                  | —       | ✓        |
| `onDeny`        | `() => void`                  | —       | ✓        |
| `description`   | `string`                      | —       | —        |
| `args`          | `Record<string, unknown>`     | —       | —        |
| `risk`          | `'low' \| 'medium' \| 'high'` | `'low'` | —        |
| `onAlwaysAllow` | `() => void`                  | —       | —        |
| `timeout`       | `number`                      | —       | —        |

`timeout` is in seconds. When provided, a live countdown is shown and `onDeny` is called automatically on expiry.

**Usage:**

```tsx
import { ToolApproval } from 'termui/components';

<ToolApproval
  name="bash"
  description="Run a shell command"
  args={{ cmd: 'git push origin main' }}
  risk="medium"
  timeout={30}
  onApprove={() => runTool()}
  onDeny={() => setApprovalPending(false)}
  onAlwaysAllow={() => addToAllowList('bash')}
/>;
```

---

## `ModelSelector`

A keyboard-navigable list for picking an AI model. Supports optional grouping by provider, context-window size display, and a checkmark on the currently selected model. Use `↑ / ↓` to move the cursor and `Enter` to confirm.

**Props:**

| Prop              | Type                   | Default | Required |
| ----------------- | ---------------------- | ------- | -------- |
| `models`          | `ModelOption[]`        | —       | ✓        |
| `selected`        | `string`               | —       | ✓        |
| `onSelect`        | `(id: string) => void` | —       | ✓        |
| `showContext`     | `boolean`              | `true`  | —        |
| `showProvider`    | `boolean`              | `true`  | —        |
| `groupByProvider` | `boolean`              | `false` | —        |

`ModelOption` shape: `{ id: string; name: string; provider: string; context?: number }`.

**Usage:**

```tsx
import { ModelSelector } from 'termui/components';

const models = [
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'Anthropic', context: 200000 },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', context: 128000 },
  { id: 'llama3.2', name: 'Llama 3.2', provider: 'Ollama', context: 128000 },
];

<ModelSelector
  models={models}
  selected={selectedModel}
  onSelect={setSelectedModel}
  groupByProvider
/>;
```

---

## `FileChange`

Displays a list of file changes proposed by an AI coding agent. Each entry shows the change type (`A` add, `M` modify, `D` delete), the file path, and an expandable diff rendered via `DiffView`. Supports per-file accept / reject and a bulk accept-all action.

**Props:**

| Prop          | Type                     | Default | Required |
| ------------- | ------------------------ | ------- | -------- |
| `changes`     | `FileChangeItem[]`       | —       | ✓        |
| `onAccept`    | `(path: string) => void` | —       | —        |
| `onReject`    | `(path: string) => void` | —       | —        |
| `onAcceptAll` | `() => void`             | —       | —        |

`FileChangeItem` shape: `{ path: string; type: 'modify' \| 'create' \| 'delete'; diff?: string; content?: string }`.

Keyboard bindings: `↑ / ↓` navigate, `Enter` or `Space` expand diff, `y` accept, `n` reject, `a` accept all.

**Usage:**

```tsx
import { FileChange } from 'termui/components';

<FileChange
  changes={[
    { path: 'src/index.ts', type: 'modify', diff: unifiedDiffString },
    { path: 'src/new-file.ts', type: 'create', content: newFileContent },
    { path: 'src/old.ts', type: 'delete' },
  ]}
  onAccept={(path) => applyChange(path)}
  onReject={(path) => rejectChange(path)}
  onAcceptAll={() => applyAll()}
/>;
```

---

## `StreamingText`

`StreamingText` is part of the Typography component set. It renders text character-by-character with a configurable speed and an optional cursor blink. See the [Typography docs](./typography.md) for full props and examples.

---

## `useChat` hook

**Package:** `@termui/adapters/ai`

Manages a full multi-turn chat conversation with streaming. Appends user and assistant messages to a `messages` array and updates the last assistant message incrementally as chunks arrive.

**Options:**

| Option         | Type                                              | Default          | Description                                       |
| -------------- | ------------------------------------------------- | ---------------- | ------------------------------------------------- |
| `provider`     | `'anthropic' \| 'openai' \| 'ollama' \| 'custom'` | `'anthropic'`    | Provider to use                                   |
| `model`        | `string`                                          | provider default | Model ID                                          |
| `apiKey`       | `string`                                          | —                | API key (falls back to env vars in provider SDKs) |
| `baseURL`      | `string`                                          | —                | Custom base URL (useful for Ollama or proxies)    |
| `systemPrompt` | `string`                                          | —                | Prepended system message                          |
| `maxTokens`    | `number`                                          | `4096`           | Max completion tokens                             |
| `temperature`  | `number`                                          | —                | Sampling temperature                              |
| `fetchFn`      | `(messages: Message[]) => AsyncIterable<string>`  | —                | Bypass built-in providers with a custom stream    |
| `onError`      | `(err: Error) => void`                            | —                | Error callback                                    |

**Return value:**

| Field         | Type                              | Description                          |
| ------------- | --------------------------------- | ------------------------------------ |
| `messages`    | `Message[]`                       | Full conversation history            |
| `sendMessage` | `(text: string) => Promise<void>` | Send a user turn                     |
| `isStreaming` | `boolean`                         | `true` while a response is in flight |
| `abort`       | `() => void`                      | Cancel the current stream            |
| `error`       | `Error \| null`                   | Last error, if any                   |
| `tokenUsage`  | `TokenUsageStats \| null`         | Token counts from the last turn      |

`Message` shape: `{ role: 'user' \| 'assistant' \| 'system'; content: string }`.
`TokenUsageStats` shape: `{ prompt: number; completion: number; total: number }`.

**Usage:**

```tsx
import { useChat } from '@termui/adapters/ai';
import { ChatThread, ChatMessage } from 'termui/components';

const { messages, sendMessage, isStreaming } = useChat({
  provider: 'anthropic',
  model: 'claude-sonnet-4-6',
  systemPrompt: 'You are a concise CLI assistant.',
});

// Send a message
await sendMessage('List the files in the current directory.');

// Render the conversation
<ChatThread>
  {messages.map((msg, i) => (
    <ChatMessage key={i} role={msg.role} streaming={isStreaming && i === messages.length - 1}>
      {msg.content}
    </ChatMessage>
  ))}
</ChatThread>;
```

---

## `useCompletion` hook

**Package:** `@termui/adapters/ai`

Single-turn text completion. Streams the result into `text`, replacing it on each new call. Useful for one-shot summarisation, code generation, or any prompt that does not require conversation history.

**Options:**

| Option        | Type                                              | Default          | Description           |
| ------------- | ------------------------------------------------- | ---------------- | --------------------- |
| `provider`    | `'anthropic' \| 'openai' \| 'ollama' \| 'custom'` | `'anthropic'`    | Provider to use       |
| `model`       | `string`                                          | provider default | Model ID              |
| `apiKey`      | `string`                                          | —                | API key               |
| `baseURL`     | `string`                                          | —                | Custom base URL       |
| `maxTokens`   | `number`                                          | —                | Max completion tokens |
| `temperature` | `number`                                          | —                | Sampling temperature  |
| `fetchFn`     | `(prompt: string) => AsyncIterable<string>`       | —                | Custom stream factory |
| `onError`     | `(err: Error) => void`                            | —                | Error callback        |

**Return value:**

| Field         | Type                                | Description                 |
| ------------- | ----------------------------------- | --------------------------- |
| `text`        | `string`                            | Accumulated completion text |
| `complete`    | `(prompt: string) => Promise<void>` | Trigger a new completion    |
| `isStreaming` | `boolean`                           | `true` while streaming      |
| `abort`       | `() => void`                        | Cancel the current stream   |
| `error`       | `Error \| null`                     | Last error, if any          |

**Usage:**

```tsx
import { useCompletion } from '@termui/adapters/ai';
import { StreamingText } from 'termui/components';

const { text, complete, isStreaming } = useCompletion({
  provider: 'openai',
  model: 'gpt-4o-mini',
});

// Trigger on mount or user action
useEffect(() => {
  complete('Write a one-line description of this project.');
}, []);

<StreamingText>{text}</StreamingText>;
```

---

## Complete example

A minimal interactive chat UI combining `ChatThread`, `TextInput`, and `useChat`.

```tsx
import React, { useState } from 'react';
import { render } from 'ink';
import { useChat } from '@termui/adapters/ai';
import { ChatThread, ChatMessage, TokenUsage, TextInput } from 'termui/components';

function ChatApp() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, isStreaming, tokenUsage } = useChat({
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    systemPrompt: 'You are a helpful terminal assistant. Be concise.',
  });

  const handleSubmit = async (value: string) => {
    if (!value.trim() || isStreaming) return;
    setInput('');
    await sendMessage(value.trim());
  };

  return (
    <>
      <ChatThread maxHeight={30}>
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} streaming={isStreaming && i === messages.length - 1}>
            {msg.content}
          </ChatMessage>
        ))}
      </ChatThread>

      {tokenUsage && (
        <TokenUsage
          prompt={tokenUsage.prompt}
          completion={tokenUsage.completion}
          model="claude-sonnet-4-6"
          showCost
        />
      )}

      <TextInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        placeholder={isStreaming ? 'Waiting for response…' : 'Ask something…'}
      />
    </>
  );
}

render(<ChatApp />);
```

# AI Assistant — TermUI Template

A streaming AI chat CLI built with TermUI.

## Quick start

```bash
npm install
npm run dev
```

## Connect a real AI provider

Install the AI adapter:

```bash
npm install @anthropic-ai/sdk
```

Replace the `useSimpleChat` hook with:

```tsx
import { useChat } from 'termui/ai';

const { messages, sendMessage, isStreaming, abort, tokenUsage } = useChat({
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

## Available providers

- `anthropic` — Claude models (requires `@anthropic-ai/sdk`)
- `openai` — GPT models (requires `openai`)
- `ollama` — Local models at `localhost:11434`
- `custom` — Provide your own `stream(messages): AsyncIterable<string>`

## Key bindings

| Key      | Action               |
| -------- | -------------------- |
| `Enter`  | Send message         |
| `Ctrl+A` | Abort current stream |
| `Ctrl+C` | Quit                 |

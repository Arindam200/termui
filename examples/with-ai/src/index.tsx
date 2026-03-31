/**
 * Example: termui/ai — useChat with a mock streaming provider
 *
 * Run: npx tsx src/index.tsx
 * Press Ctrl+C to exit
 */

import React, { useState } from 'react';
import { render, Box, Text, useApp, useInput } from 'ink';
import { Spinner, TextInput } from 'termui/components';
import { useChat } from 'termui/ai';
import type { Message } from 'termui/ai';

async function* mockStream(messages: Message[]): AsyncIterable<string> {
  const last = messages.filter((m) => m.role === 'user').pop()?.content ?? '';
  const reply = `Echo: "${last.slice(0, 50)}". Replace fetchFn with a real provider.`;
  for (const char of reply) {
    await new Promise<void>((r) => setTimeout(r, 18));
    yield char;
  }
}

const SEED: Message[] = [
  { role: 'user', content: 'What is TermUI?' },
  { role: 'assistant', content: 'TermUI is a React + Ink library for building terminal UIs.' },
  { role: 'user', content: 'Does it support streaming AI?' },
  { role: 'assistant', content: 'Yes — use useChat with fetchFn or a named provider.' },
];

function App() {
  const { exit } = useApp();
  const [input, setInput] = useState('');
  useInput((_ch, key) => {
    if (key.ctrl && _ch === 'c') exit();
  });

  const { messages, sendMessage, isStreaming, error } = useChat({
    provider: 'custom',
    fetchFn: mockStream,
    systemPrompt: 'You are a helpful terminal UI assistant.',
  });

  const history = messages.length > 0 ? messages : SEED;

  return (
    <Box flexDirection="column" gap={1} padding={1}>
      <Box borderStyle="round" borderColor="magenta" paddingX={2}>
        <Text bold color="magenta">
          TermUI · useChat demo
        </Text>
        <Text dimColor> Press Ctrl+C to exit</Text>
      </Box>

      <Box flexDirection="column" gap={0}>
        {history.map((msg, i) => {
          const isLast = i === history.length - 1;
          const streaming = isStreaming && isLast && msg.role === 'assistant';
          const label = msg.role === 'user' ? 'You' : 'AI ';
          const color = msg.role === 'user' ? 'cyan' : 'green';
          return (
            <Box key={i} gap={1}>
              <Text color={color} bold>
                {label}›
              </Text>
              <Text wrap="wrap">
                {msg.content}
                {streaming && !msg.content ? '…' : ''}
              </Text>
            </Box>
          );
        })}
      </Box>

      {error && <Text color="red">Error: {error.message}</Text>}

      <Box gap={1} alignItems="center">
        {isStreaming && <Spinner style="dots" />}
        <TextInput
          value={input}
          onChange={setInput}
          onSubmit={(val) => {
            if (!val.trim() || isStreaming) return;
            setInput('');
            void sendMessage(val);
          }}
          placeholder={isStreaming ? 'Streaming…' : 'Type a message (Enter to send)'}
          width={56}
          autoFocus
        />
      </Box>
    </Box>
  );
}

render(<App />);

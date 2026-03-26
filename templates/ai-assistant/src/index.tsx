import React, { useState, useCallback } from 'react';
import { render } from 'ink';
import { ThemeProvider } from '@termui/core';
import { Box, Text } from 'ink';
import { useInput, useTheme, useInterval } from '@termui/core';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  streaming?: boolean;
}

// ─── Simple streaming simulation ──────────────────────────────────────────
// In production, replace with: import { useChat } from 'termui/ai';
// and configure your provider (Anthropic, OpenAI, or Ollama).

function useSimpleChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'system',
      content: 'You are a helpful AI assistant.',
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    // Simulate streaming response
    // Replace this block with real API call using termui/ai
    const response = `I received your message: "${content}"\n\nTo connect a real AI provider, replace this simulation with:\n\nimport { useChat } from 'termui/ai';\nconst { sendMessage } = useChat({\n  provider: 'anthropic',\n  model: 'claude-sonnet-4-20250514',\n  apiKey: process.env.ANTHROPIC_API_KEY,\n});`;

    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= response.length) {
        clearInterval(interval);
        setIsStreaming(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: response, streaming: false } : m
          )
        );
        return;
      }
      const chunk = response.slice(0, idx + 3);
      idx += 3;
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: chunk } : m)));
    }, 30);
  }, []);

  const abort = useCallback(() => {
    setIsStreaming(false);
  }, []);

  return { messages, sendMessage, isStreaming, abort };
}

// ─── ChatMessage component ─────────────────────────────────────────────────

function ChatMessage({ message, termWidth }: { message: Message; termWidth: number }) {
  const theme = useTheme();
  const [cursorVisible, setCursorVisible] = useState(true);

  useInterval(() => {
    if (message.streaming) setCursorVisible((v) => !v);
  }, 500);

  if (message.role === 'system') return null;

  const isUser = message.role === 'user';
  const nameColor = isUser ? theme.colors.primary : theme.colors.accent;
  const name = isUser ? 'You' : 'Assistant';
  const borderColor = isUser ? theme.colors.primary : theme.colors.accent;

  return (
    <Box
      flexDirection="column"
      marginBottom={1}
      paddingLeft={1}
      paddingRight={1}
      borderStyle="single"
      borderColor={borderColor}
      width={Math.min(termWidth - 4, 80)}
      alignSelf={isUser ? 'flex-end' : 'flex-start'}
    >
      <Text bold color={nameColor}>
        {name}
      </Text>
      <Text>
        {message.content}
        {message.streaming && cursorVisible && <Text color={theme.colors.primary}>▌</Text>}
      </Text>
    </Box>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────

function App() {
  const theme = useTheme();
  const { messages, sendMessage, isStreaming, abort } = useSimpleChat();
  const [input, setInput] = useState('');
  const [termWidth] = useState(process.stdout.columns ?? 80);

  useInput((char, key) => {
    if (key.ctrl && char === 'c') process.exit(0);

    if (key.ctrl && char === 'a') {
      if (isStreaming) abort();
      return;
    }

    if (key.return) {
      if (input.trim() && !isStreaming) {
        const msg = input.trim();
        setInput('');
        sendMessage(msg);
      }
      return;
    }

    if (key.backspace || key.delete) {
      setInput((prev) => prev.slice(0, -1));
      return;
    }

    if (char && char.length === 1 && !key.ctrl && !key.meta) {
      setInput((prev) => prev + char);
    }
  });

  const visibleMessages = messages.filter((m) => m.role !== 'system');

  return (
    <Box flexDirection="column" height={process.stdout.rows ?? 24}>
      {/* Header */}
      <Box
        borderStyle="single"
        borderColor={theme.colors.primary}
        paddingLeft={1}
        paddingRight={1}
        justifyContent="space-between"
      >
        <Text bold color={theme.colors.primary}>
          AI Assistant
        </Text>
        <Text color={theme.colors.mutedForeground} dimColor>
          Ctrl+C: quit Ctrl+A: abort stream
        </Text>
      </Box>

      {/* Messages */}
      <Box flexDirection="column" flexGrow={1} paddingLeft={1} paddingRight={1} paddingTop={1}>
        {visibleMessages.length === 0 ? (
          <Box flexDirection="column" alignItems="center" paddingTop={2}>
            <Text color={theme.colors.mutedForeground} dimColor>
              Start a conversation. Type below and press Enter.
            </Text>
            <Text color={theme.colors.mutedForeground} dimColor>
              Connect termui/ai for real AI providers (Anthropic, OpenAI, Ollama).
            </Text>
          </Box>
        ) : (
          visibleMessages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} termWidth={termWidth} />
          ))
        )}
        {isStreaming && (
          <Text color={theme.colors.mutedForeground} dimColor>
            Assistant is responding...
          </Text>
        )}
      </Box>

      {/* Input area */}
      <Box
        borderStyle={isStreaming ? 'single' : 'bold'}
        borderColor={isStreaming ? theme.colors.mutedForeground : theme.colors.focusRing}
        paddingLeft={1}
        paddingRight={1}
        marginLeft={1}
        marginRight={1}
      >
        <Text color={theme.colors.mutedForeground}>{'> '}</Text>
        <Text>{input}</Text>
        <Text color={theme.colors.primary}>▌</Text>
        {isStreaming && (
          <Text color={theme.colors.mutedForeground} dimColor>
            {' '}
            (streaming...)
          </Text>
        )}
      </Box>

      {/* Token usage placeholder */}
      <Box paddingLeft={2} paddingRight={2}>
        <Text color={theme.colors.mutedForeground} dimColor>
          {isStreaming
            ? 'Streaming response...'
            : `${visibleMessages.length} messages  ·  termui/ai for real providers`}
        </Text>
      </Box>
    </Box>
  );
}

render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

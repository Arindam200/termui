/**
 * TermUI AI Agent Shell
 *
 * Claude Code-inspired terminal layout.
 *
 * Architecture: Static handles the frozen "scroll-back" content (header + history).
 * The dynamic Ink area shows only animated widgets + input + status bar — exactly
 * how Claude Code's UI works: history grows upward, input stays at the bottom.
 *
 * Run:  cd examples/ai-demo && tsx src/agent-shell.tsx
 * Send a message with Enter · Esc interrupts / quits
 */
import React, { useState, useRef, useCallback } from 'react';
import { render, Box, Text, useApp, useInput, Static } from 'ink';
import { ThemeProvider, useAnimation } from 'termui';
import { TextInput, Divider } from 'termui/components';

// ─── Colors ───────────────────────────────────────────────────────────────────
const ORANGE = '#CE9262';
const BLUE = '#7CB8FF';
const GREEN = '#4ADE80';
const MUTED = '#6B7280';

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR = [
  '    ▄████▄    ',
  '    ██▓▓██    ',
  '    ██████    ',
  '   ████████   ',
  '    ██  ██    ',
];

// ─── Mock reply ───────────────────────────────────────────────────────────────
function buildReply(prompt: string): string {
  const p = prompt.toLowerCase().trim();
  if (p.startsWith('/')) return `Command executed: ${p}. Use /help to see all available commands.`;
  if (p.includes('list') || p.includes('show') || p.includes('component'))
    return (
      'Available AI components: ChatMessage, ChatThread, ToolCall, ToolApproval, ' +
      'ModelSelector, ThinkingBlock, TokenUsage, ContextMeter, FileChange. ' +
      'Demo: cd examples/ai-demo && tsx src/index.tsx'
    );
  if (p.includes('help') || p.includes('how') || p.includes('what'))
    return 'I can read files, run commands, and answer questions about your codebase. Try asking me to explain a function, find a bug, or build a new feature.';
  return (
    `I've analysed your request: "${p.length > 40 ? p.slice(0, 40) + '…' : p}". ` +
    'All relevant source files have been examined. Here is a step-by-step breakdown of the best approach.'
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ItemType = 'header' | 'user' | 'assistant' | 'tool-group' | 'thinking' | 'note';

interface SubTool {
  name: string;
  args: string;
}

interface AnyItem {
  id: number;
  type: ItemType;
  // history fields
  content?: string;
  agentName?: string;
  agentArgs?: string;
  subTools?: SubTool[];
  note?: string;
}

// ─── Seed data ────────────────────────────────────────────────────────────────
let _id = 1;
const uid = () => _id++;

const HEADER_ITEM: AnyItem = { id: uid(), type: 'header' };

const SEED_HISTORY: AnyItem[] = [
  { id: uid(), type: 'user', content: '/clear' },
  { id: uid(), type: 'note', content: '(no content)' },
  {
    id: uid(),
    type: 'user',
    content: 'how can i test the ai components, create some demo components to try',
  },
  {
    id: uid(),
    type: 'tool-group',
    agentName: 'Explore',
    agentArgs: 'Explore AI components in TermUI',
    subTools: [
      { name: 'Read', args: 'src/ai.ts' },
      { name: 'Read', args: 'src/components-ai.ts' },
      { name: 'Bash', args: 'find . -path "*/src/hooks*" -type d | grep -v node_modules' },
    ],
    note: '+8 more tool uses (ctrl+o to expand)  ·  (ctrl+b to run in background)',
  },
  {
    id: uid(),
    type: 'thinking',
    agentName: 'Architecting',
    note: 'Tip: Open the Command Palette (Cmd+Shift+P) and run "Shell Command: Install cursor command in PATH" to enable IDE integration',
  },
  {
    id: uid(),
    type: 'assistant',
    content:
      'Created examples/ai-demo/ with 6 interactive tabs covering all 9 AI components. ' +
      'Run it: cd examples/ai-demo && tsx src/index.tsx',
  },
];

// ─── Spinner ──────────────────────────────────────────────────────────────────
const SPIN = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'] as const;
function useSpin() {
  const f = useAnimation(10);
  return SPIN[f % SPIN.length]!;
}

// ─── Static item renderer ─────────────────────────────────────────────────────

function HeaderBlock() {
  return (
    <Box borderStyle="round" borderColor={ORANGE} marginBottom={1}>
      {/* Left: identity */}
      <Box
        flexDirection="column"
        alignItems="center"
        width={40}
        paddingX={1}
        paddingY={0}
        borderStyle="single"
        borderTop={false}
        borderLeft={false}
        borderBottom={false}
        borderColor={ORANGE}
      >
        <Text color={ORANGE} bold>
          {'TermUI Agent  v1.2.0'}
        </Text>
        <Box marginTop={1} flexDirection="column" alignItems="center">
          <Text bold>{'Welcome back Arindam!'}</Text>
          {AVATAR.map((line, i) => (
            <Text key={i} color={ORANGE}>
              {line}
            </Text>
          ))}
          <Text color={MUTED} dimColor>
            {'Sonnet 4.6 · Claude Pro ·'}
          </Text>
          <Text color={MUTED} dimColor>
            {'arindammajumder@gmail.com'}
          </Text>
          <Text color={MUTED} dimColor>
            {'~/Developer/JavaScript/termi'}
          </Text>
        </Box>
      </Box>

      {/* Right: tips + activity */}
      <Box flexDirection="column" flexGrow={1} paddingX={2} paddingY={0}>
        <Text color={ORANGE} bold>
          {'Tips for getting started'}
        </Text>
        <Text color={MUTED} dimColor>
          {'Run /init to create a CLAUDE.md file with instructions for Claude'}
        </Text>
        <Box marginY={1}>
          <Divider />
        </Box>
        <Text color={ORANGE} bold>
          {'Recent activity'}
        </Text>
        <Text color={MUTED} dimColor>
          {'No recent activity'}
        </Text>
      </Box>
    </Box>
  );
}

function HistoryLine({ item }: { item: AnyItem }) {
  if (item.type === 'user') {
    return (
      <Box paddingX={1}>
        <Text color={MUTED} bold>
          {'> '}
        </Text>
        <Text bold>{item.content}</Text>
      </Box>
    );
  }

  if (item.type === 'note') {
    return (
      <Box paddingLeft={3} marginBottom={1}>
        <Text color={MUTED}>{'└ '}</Text>
        <Text dimColor>{item.content}</Text>
      </Box>
    );
  }

  if (item.type === 'tool-group') {
    return (
      <Box flexDirection="column" marginBottom={1} paddingLeft={1}>
        <Box gap={1}>
          <Text color={GREEN}>{'●'}</Text>
          <Text bold>{item.agentName}</Text>
          {item.agentArgs ? (
            <Text color={MUTED} dimColor>
              {'(' + item.agentArgs + ')'}
            </Text>
          ) : null}
        </Box>
        {item.subTools?.map((t, i) => (
          <Box key={i} paddingLeft={3}>
            <Text color={MUTED}>{i === 0 ? '└ ' : '  '}</Text>
            <Text bold color={BLUE}>
              {t.name}
            </Text>
            <Text color={MUTED} dimColor>
              {'(' + (t.args.length > 58 ? t.args.slice(0, 58) + '…' : t.args) + ')'}
            </Text>
          </Box>
        ))}
        {item.note ? (
          <Box paddingLeft={5}>
            <Text color={MUTED} dimColor>
              {item.note}
            </Text>
          </Box>
        ) : null}
      </Box>
    );
  }

  if (item.type === 'thinking') {
    return (
      <Box flexDirection="column" marginBottom={1} paddingLeft={1}>
        <Box gap={1}>
          <Text color={ORANGE}>{'*'}</Text>
          <Text color={ORANGE} bold>
            {item.agentName}
          </Text>
        </Box>
        {item.note ? (
          <Box paddingLeft={3}>
            <Text color={MUTED}>{'└ '}</Text>
            <Text color={MUTED} dimColor>
              {item.note}
            </Text>
          </Box>
        ) : null}
      </Box>
    );
  }

  if (item.type === 'assistant') {
    return (
      <Box paddingLeft={2} marginBottom={1}>
        <Text wrap="wrap">{item.content}</Text>
      </Box>
    );
  }

  return null;
}

function StaticItem({ item }: { item: AnyItem }) {
  if (item.type === 'header') return <HeaderBlock />;
  return <HistoryLine item={item} />;
}

// ─── Animated widgets (dynamic area only) ────────────────────────────────────

interface LiveTool {
  agentName: string;
  subTools: SubTool[];
}

function LiveToolGroup({ tool }: { tool: LiveTool }) {
  const spin = useSpin();
  return (
    <Box flexDirection="column" marginBottom={1} paddingLeft={1}>
      <Box gap={1}>
        <Text color={ORANGE}>{spin}</Text>
        <Text bold>{tool.agentName}</Text>
        <Text color={MUTED} dimColor>
          {'(running)'}
        </Text>
      </Box>
      {tool.subTools.map((t, i) => (
        <Box key={i} paddingLeft={3}>
          <Text color={MUTED}>{i === 0 ? '└ ' : '  '}</Text>
          <Text bold color={BLUE}>
            {t.name}
          </Text>
          <Text color={MUTED} dimColor>
            {'(' + t.args + ')'}
          </Text>
        </Box>
      ))}
      <Box paddingLeft={5}>
        <Text color={MUTED}>{'Running…'}</Text>
      </Box>
    </Box>
  );
}

function LiveThinking() {
  const spin = useSpin();
  return (
    <Box paddingLeft={1} marginBottom={1} gap={1}>
      <Text color={ORANGE}>{spin}</Text>
      <Text color={ORANGE} bold>
        {'Thinking…'}
      </Text>
    </Box>
  );
}

function LiveStream({ text }: { text: string }) {
  return (
    <Box paddingLeft={2} marginBottom={1}>
      {text ? (
        <Box>
          <Text wrap="wrap">{text}</Text>
          <Text color={MUTED}>{'▌'}</Text>
        </Box>
      ) : (
        <Text color={MUTED} dimColor>
          {'…'}
        </Text>
      )}
    </Box>
  );
}

// ─── Separator ────────────────────────────────────────────────────────────────
function Hr() {
  return (
    <Box
      borderStyle="single"
      borderTop={true}
      borderLeft={false}
      borderRight={false}
      borderBottom={false}
      borderColor={MUTED}
    />
  );
}

// ─── Main shell ───────────────────────────────────────────────────────────────
type Phase = 'idle' | 'tool' | 'thinking' | 'streaming';

function AgentShell() {
  const { exit } = useApp();

  // allItems = header item + conversation history (all rendered via Static)
  const [allItems, setAllItems] = useState<AnyItem[]>([HEADER_ITEM, ...SEED_HISTORY]);

  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [liveTool, setLiveTool] = useState<LiveTool | null>(null);
  const [streamText, setStreamText] = useState('');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const after = (ms: number, fn: () => void) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };
  const streamChars = (text: string, onDone: () => void) => {
    let i = 0;
    const tick = () => {
      if (i < text.length) {
        setStreamText(text.slice(0, i + 1));
        i++;
        timers.current.push(setTimeout(tick, 11));
      } else {
        onDone();
      }
    };
    tick();
  };

  const handleSubmit = useCallback(
    (val: string) => {
      const msg = val.trim();
      if (!msg || phase !== 'idle') return;
      setInput('');

      // Commit user message to static history
      setAllItems((prev) => [...prev, { id: uid(), type: 'user', content: msg }]);

      // Phase 1 — tool running
      setPhase('tool');
      setLiveTool({ agentName: 'Task', subTools: [{ name: 'Read', args: 'context' }] });

      after(900, () => {
        setLiveTool({
          agentName: 'Task',
          subTools: [
            { name: 'Read', args: 'context' },
            { name: 'Bash', args: `grep -rn "${msg.slice(0, 20)}" src/` },
          ],
        });
      });

      after(1800, () => {
        setAllItems((prev) => [
          ...prev,
          {
            id: uid(),
            type: 'tool-group',
            agentName: 'Task',
            agentArgs: msg.length > 42 ? msg.slice(0, 42) + '…' : msg,
            subTools: [
              { name: 'Read', args: 'context' },
              { name: 'Bash', args: `grep -rn "${msg.slice(0, 20)}" src/` },
            ],
            note: '+2 more tool uses',
          },
        ]);
        setLiveTool(null);
        setPhase('thinking');
      });

      after(2700, () => {
        setPhase('streaming');
        setStreamText('');
        const reply = buildReply(msg);
        streamChars(reply, () => {
          setAllItems((prev) => [...prev, { id: uid(), type: 'assistant', content: reply }]);
          setStreamText('');
          setPhase('idle');
        });
      });
    },
    [phase]
  );

  useInput((_ch, key) => {
    if (key.escape) {
      if (phase !== 'idle') {
        clearTimers();
        setLiveTool(null);
        setStreamText('');
        setPhase('idle');
      } else {
        exit();
      }
    }
  });

  const modeLabel =
    phase === 'idle'
      ? 'accept edits on'
      : phase === 'tool'
        ? 'running tools'
        : phase === 'thinking'
          ? 'thinking'
          : 'streaming response';

  const modeSuffix =
    phase === 'idle' ? ' (shift+tab to cycle) · esc to quit' : ' · esc to interrupt';

  return (
    <Box flexDirection="column" paddingX={1} paddingTop={0}>
      {/* Header + conversation history — printed once, never re-rendered */}
      <Static items={allItems}>{(item) => <StaticItem key={item.id} item={item} />}</Static>

      {/* Live animated widgets */}
      {liveTool && <LiveToolGroup tool={liveTool} />}
      {phase === 'thinking' && <LiveThinking />}
      {phase === 'streaming' && <LiveStream text={streamText} />}

      {/* Input */}
      <Hr />
      <Box paddingX={1} gap={1} alignItems="center">
        <Text color={MUTED} bold>
          {'>'}
        </Text>
        <TextInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          placeholder={phase === 'idle' ? 'Message (Enter to send · Esc to quit)' : ''}
          width={66}
          autoFocus
        />
      </Box>

      {/* Status bar */}
      <Hr />
      <Box paddingX={1}>
        <Text color={ORANGE} bold>
          {'►► '}
        </Text>
        <Text color={ORANGE}>{modeLabel}</Text>
        <Text color={MUTED} dimColor>
          {modeSuffix}
        </Text>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AgentShell />
    </ThemeProvider>
  );
}

render(<App />);

/**
 * TermUI Template — Form Wizard
 *
 * Multi-step form wizard with validation, progress indicator,
 * and summary review before submission.
 *
 * Run: npx tsx src/index.tsx
 */
import React, { useState } from 'react';
import { render, Box, Text, useApp, useInput } from 'ink';
import { ThemeProvider, useTheme } from '@termui/core';
import {
  TextInput,
  PasswordInput,
  EmailInput,
  NumberInput,
  Select,
  RadioGroup,
  Checkbox,
  Spinner,
  Alert,
  Badge,
  Panel,
  Stack,
  Divider,
  KeyValue,
  ProgressBar,
  StatusMessage,
} from '@termui/components';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1 — Account
  name: string;
  email: string;
  password: string;
  // Step 2 — Profile
  role: string;
  experience: number;
  timezone: string;
  // Step 3 — Preferences
  theme: string;
  notifications: boolean;
  newsletter: boolean;
}

type Step = 0 | 1 | 2 | 3 | 4; // 0-2 forms, 3 review, 4 done

// ─── Validation ───────────────────────────────────────────────────────────────

function validateStep(step: number, data: FormData): string[] {
  const errors: string[] = [];
  if (step === 0) {
    if (!data.name.trim()) errors.push('Name is required');
    if (!data.email.includes('@')) errors.push('Valid email required');
    if (data.password.length < 8) errors.push('Password must be 8+ characters');
  }
  if (step === 1) {
    if (!data.role) errors.push('Role is required');
    if (data.experience < 0) errors.push('Experience must be ≥ 0');
  }
  return errors;
}

// ─── Step 1 — Account ─────────────────────────────────────────────────────────

function AccountStep({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (d: Partial<FormData>) => void;
}) {
  const theme = useTheme();
  return (
    <Stack direction="vertical" gap={1}>
      <Text color={theme.colors.mutedForeground} dimColor>
        Tab between fields · Enter to submit
      </Text>
      <Panel title="Full Name">
        <TextInput
          value={data.name}
          onChange={(v) => onChange({ name: v })}
          placeholder="Jane Smith"
          autoFocus
        />
      </Panel>
      <Panel title="Email Address">
        <EmailInput
          value={data.email}
          onChange={(v) => onChange({ email: v })}
          placeholder="jane@example.com"
        />
      </Panel>
      <Panel title="Password  (min 8 chars)">
        <PasswordInput
          value={data.password}
          onChange={(v) => onChange({ password: v })}
          placeholder="••••••••"
          showStrength
        />
      </Panel>
    </Stack>
  );
}

// ─── Step 2 — Profile ─────────────────────────────────────────────────────────

function ProfileStep({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (d: Partial<FormData>) => void;
}) {
  const roleOptions = [
    { value: 'frontend', label: 'Frontend Developer' },
    { value: 'backend', label: 'Backend Developer' },
    { value: 'fullstack', label: 'Full-Stack Developer' },
    { value: 'devops', label: 'DevOps / SRE' },
    { value: 'designer', label: 'Designer' },
    { value: 'manager', label: 'Engineering Manager' },
  ];

  const tzOptions = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern (ET)' },
    { value: 'America/Chicago', label: 'Central (CT)' },
    { value: 'America/Denver', label: 'Mountain (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  ];

  return (
    <Stack direction="vertical" gap={1}>
      <Panel title="Role">
        <RadioGroup
          options={roleOptions}
          value={data.role}
          onChange={(v) => onChange({ role: v })}
        />
      </Panel>
      <Panel title="Years of Experience">
        <NumberInput
          value={data.experience}
          onChange={(v) => onChange({ experience: v })}
          min={0}
          max={40}
          step={1}
        />
      </Panel>
      <Panel title="Timezone">
        <Select
          options={tzOptions}
          value={data.timezone}
          onChange={(v) => onChange({ timezone: v })}
        />
      </Panel>
    </Stack>
  );
}

// ─── Step 3 — Preferences ─────────────────────────────────────────────────────

function PreferencesStep({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (d: Partial<FormData>) => void;
}) {
  const themeOptions = [
    { value: 'default', label: 'Default' },
    { value: 'dracula', label: 'Dracula' },
    { value: 'nord', label: 'Nord' },
    { value: 'catppuccin', label: 'Catppuccin' },
  ];

  return (
    <Stack direction="vertical" gap={1}>
      <Panel title="UI Theme">
        <RadioGroup
          options={themeOptions}
          value={data.theme}
          onChange={(v) => onChange({ theme: v })}
        />
      </Panel>
      <Panel title="Notifications">
        <Stack direction="vertical" gap={0}>
          <Checkbox
            checked={data.notifications}
            onChange={(v) => onChange({ notifications: v })}
            label="Enable push notifications"
          />
          <Checkbox
            checked={data.newsletter}
            onChange={(v) => onChange({ newsletter: v })}
            label="Subscribe to newsletter"
          />
        </Stack>
      </Panel>
    </Stack>
  );
}

// ─── Review step ──────────────────────────────────────────────────────────────

function ReviewStep({ data }: { data: FormData }) {
  const theme = useTheme();
  return (
    <Stack direction="vertical" gap={1}>
      <Text bold color={theme.colors.primary}>
        Review your information
      </Text>
      <Panel title="Account">
        <KeyValue
          items={[
            { key: 'Name', value: data.name },
            { key: 'Email', value: data.email },
            { key: 'Password', value: '••••••••' },
          ]}
        />
      </Panel>
      <Panel title="Profile">
        <KeyValue
          items={[
            { key: 'Role', value: data.role },
            { key: 'Experience', value: `${data.experience} years` },
            { key: 'Timezone', value: data.timezone },
          ]}
        />
      </Panel>
      <Panel title="Preferences">
        <KeyValue
          items={[
            { key: 'Theme', value: data.theme },
            { key: 'Notifications', value: data.notifications ? 'Yes' : 'No' },
            { key: 'Newsletter', value: data.newsletter ? 'Yes' : 'No' },
          ]}
        />
      </Panel>
    </Stack>
  );
}

// ─── Submitting ───────────────────────────────────────────────────────────────

function SubmittingStep() {
  const theme = useTheme();
  return (
    <Stack direction="vertical" gap={1}>
      <Box gap={1}>
        <Spinner style="dots" />
        <Text color={theme.colors.primary}>Creating your account…</Text>
      </Box>
      <StatusMessage variant="loading">Setting up workspace…</StatusMessage>
    </Stack>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const STEP_TITLES = ['Account', 'Profile', 'Preferences', 'Review'];

function Wizard() {
  const theme = useTheme();
  const { exit } = useApp();

  const [step, setStep] = useState<Step>(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [data, setData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    role: '',
    experience: 0,
    timezone: 'UTC',
    theme: 'default',
    notifications: true,
    newsletter: false,
  });

  useInput((_i, key) => {
    if (key.escape) {
      if (step > 0) setStep((s) => (s - 1) as Step);
      else exit();
    }
    if (key.ctrl && _i === 'n') advance();
    if (key.ctrl && _i === 'p') {
      if (step > 0) setStep((s) => (s - 1) as Step);
    }
  });

  function advance() {
    if (step < 3) {
      const errs = validateStep(step, data);
      if (errs.length > 0) {
        setErrors(errs);
        return;
      }
      setErrors([]);
      setStep((s) => (s + 1) as Step);
    } else {
      // Submit
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setDone(true);
      }, 2000);
    }
  }

  const update = (partial: Partial<FormData>) => setData((d) => ({ ...d, ...partial }));
  const progress = Math.round(((step === 3 ? 3 : step) / 3) * 100);

  if (done) {
    return (
      <Box flexDirection="column" padding={1} gap={1}>
        <Alert variant="success" title="Account created!">
          Welcome, {data.name}! Your account is ready.
        </Alert>
        <Text dimColor>Press Esc to quit.</Text>
      </Box>
    );
  }

  if (submitting) {
    return (
      <Box padding={1}>
        <SubmittingStep />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      {/* Header */}
      <Box justifyContent="space-between" alignItems="center">
        <Text bold color={theme.colors.primary}>
          ◆ Create Account
        </Text>
        <Text dimColor>Step {Math.min(step + 1, 4)} of 4</Text>
      </Box>

      {/* Progress */}
      <ProgressBar value={progress} total={100} color={theme.colors.primary} />

      {/* Step indicator */}
      <Box gap={2}>
        {STEP_TITLES.map((title, i) => (
          <Box key={title} gap={1}>
            <Badge variant={i < step ? 'success' : i === step ? 'info' : 'default'}>
              {i < step ? '✓' : String(i + 1)}
            </Badge>
            <Text color={i === step ? theme.colors.foreground : theme.colors.mutedForeground}>
              {title}
            </Text>
          </Box>
        ))}
      </Box>

      <Divider />

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="error" title="Please fix the following">
          {errors.join('\n')}
        </Alert>
      )}

      {/* Step content */}
      {step === 0 && <AccountStep data={data} onChange={update} />}
      {step === 1 && <ProfileStep data={data} onChange={update} />}
      {step === 2 && <PreferencesStep data={data} onChange={update} />}
      {step === 3 && <ReviewStep data={data} />}

      <Divider />

      {/* Footer */}
      <Box justifyContent="space-between">
        <Text dimColor>{step > 0 ? 'Esc / Ctrl+P  back' : 'Esc  quit'}</Text>
        <Text color={theme.colors.primary} bold>
          {step < 3 ? 'Ctrl+N  next →' : 'Ctrl+N  submit ✓'}
        </Text>
      </Box>
    </Box>
  );
}

render(
  <ThemeProvider>
    <Wizard />
  </ThemeProvider>
);

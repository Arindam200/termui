import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from '@termui/testing';
import { ThemeProvider, NotificationsContext } from '@termui/core';
import type { NotificationsContextValue, Notification } from '@termui/core';
import { NotificationCenter } from './NotificationCenter.js';

// Build a minimal NotificationsContextValue for tests
function makeCtx(
  notifications: Notification[],
  overrides: Partial<NotificationsContextValue> = {}
): NotificationsContextValue {
  return {
    notifications,
    notify: vi.fn(() => 'test-id'),
    dismiss: vi.fn(),
    markRead: vi.fn(),
    clear: vi.fn(),
    ...overrides,
  };
}

// Build a Notification object with sensible defaults
function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'n1',
    title: 'Test Notification',
    variant: 'info',
    timestamp: Date.now(),
    read: false,
    duration: 999999, // prevent auto-dismiss during tests
    ...overrides,
  };
}

function wrap(
  el: React.ReactElement,
  notifications: Notification[] = [],
  ctxOverrides: Partial<NotificationsContextValue> = {}
) {
  const ctx = makeCtx(notifications, ctxOverrides);
  return (
    <ThemeProvider>
      <NotificationsContext.Provider value={ctx}>{el}</NotificationsContext.Provider>
    </ThemeProvider>
  );
}

describe('NotificationCenter', () => {
  it('renders nothing when there are no notifications', async () => {
    const output = await renderToString(wrap(<NotificationCenter />, []));
    expect(output).toBe('');
  });

  it('renders a notification title', async () => {
    const notifs = [makeNotification({ title: 'File Saved' })];
    const output = await renderToString(wrap(<NotificationCenter />, notifs));
    expect(output).toContain('File Saved');
  });

  it('renders notification body when provided', async () => {
    const notifs = [makeNotification({ title: 'Done', body: 'Operation completed.' })];
    const output = await renderToString(wrap(<NotificationCenter />, notifs));
    expect(output).toContain('Operation completed.');
  });

  it('does not render body section when body is absent', async () => {
    const notifs = [makeNotification({ title: 'Silent', body: undefined })];
    const output = await renderToString(wrap(<NotificationCenter />, notifs));
    expect(output).toContain('Silent');
    // Body area should just not be there — title is still present
    expect(output).not.toContain('undefined');
  });

  it('renders the success icon ✓', async () => {
    const notifs = [makeNotification({ variant: 'success', title: 'Saved' })];
    const output = await renderToString(wrap(<NotificationCenter />, notifs));
    expect(output).toContain('✓');
  });

  it('renders the error icon ✗', async () => {
    const notifs = [makeNotification({ variant: 'error', title: 'Failed' })];
    const output = await renderToString(wrap(<NotificationCenter />, notifs));
    expect(output).toContain('✗');
  });

  it('renders the warning icon ⚠', async () => {
    const notifs = [makeNotification({ variant: 'warning', title: 'Careful' })];
    const output = await renderToString(wrap(<NotificationCenter />, notifs));
    expect(output).toContain('⚠');
  });

  it('renders the info icon ℹ', async () => {
    const notifs = [makeNotification({ variant: 'info', title: 'Note' })];
    const output = await renderToString(wrap(<NotificationCenter />, notifs));
    expect(output).toContain('ℹ');
  });

  it('shows at most maxVisible notifications', async () => {
    const notifs = [
      makeNotification({ id: 'n1', title: 'First' }),
      makeNotification({ id: 'n2', title: 'Second' }),
      makeNotification({ id: 'n3', title: 'Third' }),
      makeNotification({ id: 'n4', title: 'Fourth' }),
    ];
    // maxVisible=2 → only last 2 should appear
    const output = await renderToString(wrap(<NotificationCenter maxVisible={2} />, notifs));
    expect(output).not.toContain('First');
    expect(output).not.toContain('Second');
    expect(output).toContain('Third');
    expect(output).toContain('Fourth');
  });

  it('defaults to maxVisible=3', async () => {
    const notifs = [
      makeNotification({ id: 'n1', title: 'Alpha' }),
      makeNotification({ id: 'n2', title: 'Beta' }),
      makeNotification({ id: 'n3', title: 'Gamma' }),
      makeNotification({ id: 'n4', title: 'Delta' }),
    ];
    const output = await renderToString(wrap(<NotificationCenter />, notifs));
    expect(output).not.toContain('Alpha');
    expect(output).toContain('Beta');
    expect(output).toContain('Gamma');
    expect(output).toContain('Delta');
  });

  it('renders multiple notifications at once', async () => {
    const notifs = [
      makeNotification({ id: 'n1', title: 'First Message', variant: 'info' }),
      makeNotification({ id: 'n2', title: 'Second Message', variant: 'success' }),
    ];
    const output = await renderToString(wrap(<NotificationCenter />, notifs));
    expect(output).toContain('First Message');
    expect(output).toContain('Second Message');
    expect(output).toContain('ℹ');
    expect(output).toContain('✓');
  });

  it('position=bottom renders newest notification last', async () => {
    const notifs = [
      makeNotification({ id: 'n1', title: 'Older' }),
      makeNotification({ id: 'n2', title: 'Newer' }),
    ];
    const output = await renderToString(
      wrap(<NotificationCenter position="bottom" />, notifs)
    );
    const olderIdx = output.indexOf('Older');
    const newerIdx = output.indexOf('Newer');
    expect(olderIdx).toBeLessThan(newerIdx);
  });

  it('position=top renders newest notification first', async () => {
    const notifs = [
      makeNotification({ id: 'n1', title: 'Older' }),
      makeNotification({ id: 'n2', title: 'Newer' }),
    ];
    const output = await renderToString(
      wrap(<NotificationCenter position="top" />, notifs)
    );
    const newerIdx = output.indexOf('Newer');
    const olderIdx = output.indexOf('Older');
    expect(newerIdx).toBeLessThan(olderIdx);
  });

  it('renders a single notification when maxVisible=1', async () => {
    const notifs = [
      makeNotification({ id: 'n1', title: 'Alpha' }),
      makeNotification({ id: 'n2', title: 'Beta' }),
      makeNotification({ id: 'n3', title: 'Gamma' }),
    ];
    const output = await renderToString(wrap(<NotificationCenter maxVisible={1} />, notifs));
    expect(output).not.toContain('Alpha');
    expect(output).not.toContain('Beta');
    expect(output).toContain('Gamma');
  });
});

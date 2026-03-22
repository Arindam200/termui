/**
 * termui/clack-ink — Ink + TermUI themed prompts (optional @termui/core + @termui/components).
 */

import React from 'react';
import { render } from 'ink';
import { ThemeProvider } from '@termui/core';
import { Confirm, Select } from '@termui/components';

export async function selectInk<T>(opts: {
  message: string;
  options: { value: T; label: string; hint?: string }[];
}): Promise<T> {
  return new Promise((resolve, reject) => {
    const { waitUntilExit, unmount } = render(
      <ThemeProvider>
        <Select
          label={opts.message}
          options={opts.options.map((o) => ({ value: o.value, label: o.label, hint: o.hint }))}
          onSubmit={(v) => {
            resolve(v);
            unmount();
          }}
        />
      </ThemeProvider>
    );
    waitUntilExit().catch(reject);
  });
}

export async function confirmInk(opts: {
  message: string;
  initialValue?: boolean;
}): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const { waitUntilExit, unmount } = render(
      <ThemeProvider>
        <Confirm
          message={opts.message}
          defaultValue={opts.initialValue}
          onConfirm={() => {
            resolve(true);
            unmount();
          }}
          onCancel={() => {
            resolve(false);
            unmount();
          }}
        />
      </ThemeProvider>
    );
    waitUntilExit().catch(reject);
  });
}

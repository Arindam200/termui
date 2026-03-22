/**
 * termui/keychain adapter — keytar via dynamic import when available.
 */

import { useCallback, useEffect, useState } from 'react';

export type KeytarModule = typeof import('keytar');

export async function loadKeytar(): Promise<KeytarModule | null> {
  try {
    return await import('keytar');
  } catch {
    return null;
  }
}

export function useKeychain(service: string): {
  keytar: KeytarModule | null;
  available: boolean;
  get: (account: string) => Promise<string | null>;
  set: (account: string, password: string) => Promise<void>;
  del: (account: string) => Promise<boolean>;
} {
  const [keytar, setKeytar] = useState<KeytarModule | null>(null);

  useEffect(() => {
    loadKeytar().then(setKeytar);
  }, []);

  const get = useCallback(
    async (account: string) => {
      if (!keytar) return null;
      return keytar.getPassword(service, account);
    },
    [keytar, service]
  );

  const set = useCallback(
    async (account: string, password: string) => {
      if (!keytar) throw new Error('keytar is not available');
      await keytar.setPassword(service, account, password);
    },
    [keytar, service]
  );

  const del = useCallback(
    async (account: string) => {
      if (!keytar) return false;
      return keytar.deletePassword(service, account);
    },
    [keytar, service]
  );

  return {
    keytar,
    available: keytar !== null,
    get,
    set,
    del,
  };
}

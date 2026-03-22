/**
 * termui/github adapter — Octokit with optional loading-friendly API.
 * Requires optional peer `@octokit/rest`.
 */

import { useEffect, useState } from 'react';

export function useGitHub(authToken?: string): {
  octokit: unknown;
  loading: boolean;
  error: Error | null;
} {
  const [octokit, setOctokit] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { Octokit } = await import('@octokit/rest');
        if (cancelled) return;
        setOctokit(new Octokit({ auth: authToken }));
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
          setOctokit(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authToken]);

  return { octokit, loading, error };
}

export async function createOctokit(authToken?: string): Promise<unknown> {
  const { Octokit } = await import('@octokit/rest');
  return new Octokit({ auth: authToken });
}

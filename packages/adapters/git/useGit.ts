import { useEffect, useState } from 'react';
import { simpleGit } from 'simple-git';
import type { StatusResult } from 'simple-git';

export interface UseGitState {
  branch: string;
  loading: boolean;
  error: Error | null;
  status: StatusResult | null;
}

export function useGit(cwd: string): UseGitState {
  const [state, setState] = useState<UseGitState>({
    branch: '',
    loading: true,
    error: null,
    status: null,
  });

  useEffect(() => {
    let cancelled = false;
    const git = simpleGit(cwd);

    (async () => {
      try {
        const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
        const status = await git.status();
        if (!cancelled) {
          setState({ branch: branch.trim(), loading: false, error: null, status });
        }
      } catch (e) {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            loading: false,
            error: e instanceof Error ? e : new Error(String(e)),
          }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cwd]);

  return state;
}

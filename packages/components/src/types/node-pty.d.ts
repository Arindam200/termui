declare module 'node-pty' {
  interface IPty {
    onData: (callback: (data: string) => void) => void;
    onExit: (callback: (e: { exitCode: number }) => void) => void;
    kill: () => void;
    write: (data: string) => void;
    resize: (cols: number, rows: number) => void;
  }

  function spawn(
    file: string,
    args: string[],
    options: {
      name?: string;
      cols?: number;
      rows?: number;
      cwd?: string;
      env?: Record<string, string>;
    }
  ): IPty;
}

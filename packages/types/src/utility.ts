export interface TimerProps {
  seconds: number;
  onComplete?: () => void;
  format?: 'mm:ss' | 'hh:mm:ss' | 's';
  paused?: boolean;
}

export interface ClockProps {
  format?: '12h' | '24h';
  showSeconds?: boolean;
  timezone?: string;
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp?: number;
}

export interface LogProps {
  entries?: LogEntry[];
  maxLines?: number;
  follow?: boolean;
}

export interface QRCodeProps {
  value: string;
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface ImageProps {
  src: string;
  width?: number;
  height?: number;
  protocol?: 'auto' | 'iterm2' | 'kitty' | 'ascii';
  fallback?: string;
}

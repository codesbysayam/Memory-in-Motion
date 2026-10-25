import { InterferenceConfig } from '../models/interferenceLabEngine';

export interface DiagnosticLogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  componentStack?: string;
  experimentConfig: Partial<InterferenceConfig> | null;
  metadata?: Record<string, unknown>;
}

type LogListener = (entry: DiagnosticLogEntry) => void;

class DiagnosticLogger {
  private logs: DiagnosticLogEntry[] = [];
  private listeners: Set<LogListener> = new Set();
  private maxLogs: number = 50;

  constructor() {
    // Try restoring recent diagnostic logs from sessionStorage
    try {
      const stored = sessionStorage.getItem('mim_diagnostic_logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch {
      // Storage access may be restricted in sandboxed environments
    }
  }

  public logError(
    error: Error,
    config?: Partial<InterferenceConfig> | null,
    errorInfo?: { componentStack?: string | null },
    metadata?: Record<string, unknown>
  ): DiagnosticLogEntry {
    const entry: DiagnosticLogEntry = {
      id: `diag-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      level: 'error',
      message: error.message || 'Unknown experiment computation error',
      error: {
        name: error.name || 'Error',
        message: error.message || 'Unknown error',
        stack: error.stack,
      },
      componentStack: errorInfo?.componentStack || undefined,
      experimentConfig: config ? { ...config } : null,
      metadata: metadata ? { ...metadata } : undefined,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Persist to session storage safely
    try {
      sessionStorage.setItem('mim_diagnostic_logs', JSON.stringify(this.logs));
    } catch {
      // ignore
    }

    // Inform listeners
    this.listeners.forEach((listener) => {
      try {
        listener(entry);
      } catch (err) {
        console.warn('Error in diagnostic logger subscriber:', err);
      }
    });

    // Output formatted diagnostic trace to console
    this.outputToConsole(entry, error);

    return entry;
  }

  private outputToConsole(entry: DiagnosticLogEntry, rawError: Error) {
    const headerStyle =
      'background: #D96B43; color: white; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;';
    const subStyle = 'color: #21445B; font-weight: bold; font-family: monospace; font-size: 11px;';

    console.groupCollapsed(
      `%c[Memory in Motion · Diagnostic Logger]%c Experiment Computation Failure: ${entry.error.name} - "${entry.error.message}"`,
      headerStyle,
      'color: #9B2C2C; font-weight: bold; margin-left: 6px;'
    );

    console.error('1. Error Object:', rawError);

    if (entry.experimentConfig) {
      console.log('%c2. Current Experiment Configuration (Shared State):%c', subStyle, '');
      console.table(entry.experimentConfig);
      console.log('Raw Config Object:', entry.experimentConfig);
    } else {
      console.warn('2. Experiment Configuration: Not available or not yet initialized.');
    }

    if (entry.componentStack) {
      console.log('%c3. React Component Stack:%c', subStyle, '');
      console.log(entry.componentStack);
    }

    if (entry.metadata) {
      console.log('%c4. Additional Context Metadata:%c', subStyle, '');
      console.log(entry.metadata);
    }

    console.log(`Diagnostic Record ID: ${entry.id} | Timestamp: ${entry.timestamp}`);
    console.groupEnd();
  }

  public getLogs(): DiagnosticLogEntry[] {
    return [...this.logs];
  }

  public getLatestError(): DiagnosticLogEntry | null {
    return this.logs[0] || null;
  }

  public clearLogs(): void {
    this.logs = [];
    try {
      sessionStorage.removeItem('mim_diagnostic_logs');
    } catch {
      // ignore
    }
  }

  public subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public exportLogsAsJson(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const diagnosticLogger = new DiagnosticLogger();

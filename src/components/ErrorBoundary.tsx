import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  AlertOctagon,
  RotateCw,
  RotateCcw,
  Copy,
  Check,
  Terminal,
  ChevronDown,
  ChevronUp,
  Cpu,
  Sliders,
  FileCode,
} from 'lucide-react';
import { diagnosticLogger, DiagnosticLogEntry } from '../utils/diagnosticLogger';
import {
  getActiveExperimentConfig,
  setActiveExperimentConfig,
  getLastValidExperimentConfig,
  reexecuteLastValidExperiment,
  DEFAULT_INTERFERENCE_CONFIG,
  InterferenceConfig,
} from '../models/interferenceLabEngine';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void, retry?: () => void, lastValidConfig?: InterferenceConfig) => ReactNode);
  onReset?: () => void;
  onRetry?: (lastValidConfig: InterferenceConfig) => void;
  retryLastOperation?: () => void;
  reexecuteLastValid?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKey?: unknown;
  title?: string;
  description?: string;
  resetLabel?: string;
  retryLabel?: string;
  sectionName?: string;
  experimentConfig?: Partial<InterferenceConfig> | null;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  showDetails: boolean;
  remountKey: number;
  capturedConfig: Partial<InterferenceConfig> | null;
  lastValidConfig: InterferenceConfig | null;
  diagnosticLogId: string | null;
  isRetrying: boolean;
  retryCount: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
      remountKey: 0,
      capturedConfig: null,
      lastValidConfig: null,
      diagnosticLogId: null,
      isRetrying: false,
      retryCount: 0,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 1. Capture current experiment config at moment of failure
    const currentConfig: Partial<InterferenceConfig> =
      this.props.experimentConfig || getActiveExperimentConfig();

    // 2. Retrieve the last valid experiment configuration before the failure occurred
    const lastValid: InterferenceConfig = getLastValidExperimentConfig();

    // 3. Dispatch to internal diagnostic logger
    const logEntry: DiagnosticLogEntry = diagnosticLogger.logError(
      error,
      currentConfig,
      errorInfo,
      {
        section: this.props.sectionName || '04 / When Memory Collides (Interference Lab)',
        timestamp: new Date().toISOString(),
        retryAttempt: this.state.retryCount,
        lastValidConfig: lastValid,
      }
    );

    // 4. Direct explicit console logging
    console.error(
      '[ErrorBoundary] Experiment computation failed in Section04InterferenceLab:\n',
      '• Error Object:', error,
      '\n• Current Experiment Configuration (At Failure):', currentConfig,
      '\n• Last Valid Configuration Before Failure:', lastValid
    );

    this.setState({
      errorInfo,
      capturedConfig: currentConfig,
      lastValidConfig: lastValid,
      diagnosticLogId: logEntry.id,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  public componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.props.resetKey !== undefined && prevProps.resetKey !== this.props.resetKey) {
      this.handleFullReset();
    }
  }

  /**
   * 'Retry Last Operation':
   * Calls the function responsible for re-executing the last valid experiment configuration
   * before the failure occurred.
   */
  public handleRetryLastOperation = () => {
    // 1. Retrieve the verified last valid experiment configuration before the failure occurred
    const validConfig: InterferenceConfig =
      this.state.lastValidConfig || getLastValidExperimentConfig() || { ...DEFAULT_INTERFERENCE_CONFIG };

    console.info(
      '%c[ErrorBoundary] Calling function to re-execute last valid experiment configuration before failure:%c',
      'background: #21445B; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
      '',
      validConfig
    );

    // 2. Invoke the function responsible for re-executing the last valid experiment configuration
    if (this.props.retryLastOperation) {
      this.props.retryLastOperation();
    } else if (this.props.reexecuteLastValid) {
      this.props.reexecuteLastValid();
    } else {
      reexecuteLastValidExperiment();
    }

    if (this.props.onRetry) {
      this.props.onRetry(validConfig);
    }

    // 3. Reset error boundary state and remount children with the verified last valid config
    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      isRetrying: true,
      retryCount: prev.retryCount + 1,
      remountKey: prev.remountKey + 1,
      capturedConfig: validConfig,
    }));
  };

  /**
   * Alias for handleRetryLastOperation to ensure backward compatibility
   */
  public handleRetry = () => {
    this.handleRetryLastOperation();
  };

  /**
   * Full reset: reinitializes matrix state, clears failed configs, and returns to canonical defaults.
   */
  public handleFullReset = () => {
    setActiveExperimentConfig({ ...DEFAULT_INTERFERENCE_CONFIG });
    try {
      localStorage.removeItem('mim_interference_lab_config');
      localStorage.removeItem('mim_interference_lab_notebook');
    } catch {
      // ignore
    }

    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
      isRetrying: false,
      retryCount: 0,
      capturedConfig: null,
      lastValidConfig: null,
      diagnosticLogId: null,
      remountKey: prev.remountKey + 1,
    }));

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public handleReset = () => {
    this.handleFullReset();
  };

  public handleCopyDiagnostics = async () => {
    const { error, errorInfo, capturedConfig, lastValidConfig, diagnosticLogId, retryCount } = this.state;
    const report = [
      `=== Memory in Motion — Laboratory Diagnostic Report ===`,
      `Diagnostic ID: ${diagnosticLogId || 'N/A'}`,
      `Retry Count: ${retryCount}`,
      `Timestamp: ${new Date().toISOString()}`,
      `Section: ${this.props.sectionName || '04 / When Memory Collides (Interference Lab)'}`,
      ``,
      `--- Last Valid Experiment Configuration (Before Failure) ---`,
      JSON.stringify(lastValidConfig, null, 2),
      ``,
      `--- Experiment Configuration at Interruption ---`,
      JSON.stringify(capturedConfig, null, 2),
      ``,
      `--- Exception Details ---`,
      `Error Name: ${error?.name || 'Error'}`,
      `Error Message: ${error?.message || 'Unknown error'}`,
      `Stack Trace:`,
      error?.stack || 'N/A',
      ``,
      `--- Component Stack ---`,
      errorInfo?.componentStack || 'N/A',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(report);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (e) {
      console.warn('Failed to copy diagnostics to clipboard', e);
    }
  };

  public handleLogToConsoleAgain = () => {
    const { error, capturedConfig, errorInfo, lastValidConfig } = this.state;
    if (error) {
      diagnosticLogger.logError(error, capturedConfig, errorInfo || undefined, {
        retriggeredByUser: true,
        retryCount: this.state.retryCount,
        lastValidConfig,
      });
    }
  };

  public render(): ReactNode {
    const {
      hasError,
      error,
      errorInfo,
      copied,
      showDetails,
      remountKey,
      capturedConfig,
      lastValidConfig,
      diagnosticLogId,
      isRetrying,
      retryCount,
    } = this.state;
    const { children, fallback, title, description, resetLabel, retryLabel, sectionName } = this.props;

    if (hasError) {
      if (typeof fallback === 'function' && error) {
        return fallback(error, this.handleFullReset, this.handleRetryLastOperation, lastValidConfig || undefined);
      }
      if (fallback && typeof fallback !== 'function') {
        return fallback;
      }

      const configToRetry = lastValidConfig || (capturedConfig as InterferenceConfig) || DEFAULT_INTERFERENCE_CONFIG;

      return (
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-[#FAF8F5] border-2 border-[#D96B43]/40 rounded-2xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#D96B43]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            {/* Header / Badge Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#E5E0D8]">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#FBEAE5] text-[#D96B43] border border-[#F5C6B8]">
                  <AlertOctagon className="w-4 h-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#FBEAE5] text-[#D96B43] border border-[#F5C6B8]">
                      Runtime Recovery
                    </span>
                    {retryCount > 0 && (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                        Attempt #{retryCount + 1}
                      </span>
                    )}
                    <span className="text-xs font-mono text-[#7D776D]">
                      {sectionName || 'Section 04 · Interference Lab'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs text-[#7D776D]">
                {diagnosticLogId && (
                  <span className="px-2 py-0.5 rounded bg-[#EAE6DF] text-[#4A4742] border border-[#D9DCD8]">
                    LOG: {diagnosticLogId}
                  </span>
                )}
                <div className="flex items-center gap-1 text-[#21445B]">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Associative Engine</span>
                </div>
              </div>
            </div>

            {/* Main Error Details */}
            <div className="py-6 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#252525] tracking-tight">
                {title || 'Matrix Computation Interrupted'}
              </h2>
              <p className="text-sm sm:text-base text-[#52504A] font-sans max-w-3xl leading-relaxed">
                {description ||
                  'An unexpected mathematical or state exception occurred during recurrent associative memory computation. You can retry re-executing the last valid experiment configuration before the failure occurred or perform a full reset to default baseline.'}
              </p>

              {/* Exception notification box */}
              {error && (
                <div className="p-4 rounded-xl bg-white border border-[#E5E0D8] font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-[#9B2C2C]">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Exception: {error.name || 'ComputationError'}</span>
                    </div>
                    <span className="text-[10px] text-[#7D776D] uppercase">Logged to Console & Internal Diagnostic Log</span>
                  </div>
                  <div className="pl-5 break-words font-sans text-xs text-[#252525] font-medium">
                    {error.message || 'Unknown matrix computation anomaly.'}
                  </div>
                </div>
              )}

              {/* Last Valid Experiment Configuration (To Be Re-Executed on Retry) */}
              <div className="p-4 rounded-xl bg-[#F0F6FA] border border-[#CDE1F0] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#21445B]">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>LAST VALID CONFIGURATION (RE-EXECUTED ON &quot;RETRY LAST OPERATION&quot;)</span>
                  </div>
                  <span className="text-[11px] font-sans text-[#21445B] font-medium">
                    Verified valid parameter state prior to failure
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 font-mono text-xs">
                  <div className="bg-white p-2 rounded border border-[#CDE1F0]">
                    <span className="text-[10px] text-[#5A778D] block">DIMENSION (D)</span>
                    <span className="font-bold text-[#21445B]">{configToRetry.dimension ?? 'N/A'}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-[#CDE1F0]">
                    <span className="text-[10px] text-[#5A778D] block">SEQ LENGTH (L)</span>
                    <span className="font-bold text-[#21445B]">{configToRetry.sequenceLength ?? 'N/A'}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-[#CDE1F0]">
                    <span className="text-[10px] text-[#5A778D] block">RETENTION (λ)</span>
                    <span className="font-bold text-[#21445B]">
                      {configToRetry.retention !== undefined
                        ? `${Math.round(configToRetry.retention * 100)}%`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded border border-[#CDE1F0]">
                    <span className="text-[10px] text-[#5A778D] block">INTERFERENCE</span>
                    <span className="font-bold text-[#21445B]">
                      {configToRetry.interference !== undefined
                        ? `${Math.round(configToRetry.interference * 100)}%`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded border border-[#CDE1F0]">
                    <span className="text-[10px] text-[#5A778D] block">WRITE STRENGTH</span>
                    <span className="font-bold text-[#21445B]">{configToRetry.writeStrength ?? 'N/A'}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-[#CDE1F0]">
                    <span className="text-[10px] text-[#5A778D] block">SEED</span>
                    <span className="font-bold text-[#21445B]">{configToRetry.seed ?? 'N/A'}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-[#CDE1F0]">
                    <span className="text-[10px] text-[#5A778D] block">TARGET KEY</span>
                    <span className="font-bold text-[#21445B] truncate">{configToRetry.targetKey ?? 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recovery Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2 pb-6 border-b border-[#E5E0D8]">
              {/* 1. Retry Last Operation (Calls function to re-execute last valid experiment configuration) */}
              <button
                type="button"
                onClick={this.handleRetryLastOperation}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#21445B] hover:bg-[#163041] text-white font-sans text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                title={`Re-executes last valid configuration before failure (D=${configToRetry.dimension}, L=${configToRetry.sequenceLength}, λ=${Math.round(configToRetry.retention * 100)}%)`}
              >
                <RotateCw className="w-4 h-4" />
                <span>
                  {retryLabel || (retryCount > 0 ? `Retry Last Operation (Attempt #${retryCount + 1})` : 'Retry Last Operation')}
                </span>
              </button>

              {/* 2. Full Reset to Defaults */}
              <button
                type="button"
                onClick={this.handleFullReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-[#F2EFE9] text-[#252525] border border-[#D9DCD8] font-sans text-sm font-medium transition-colors cursor-pointer"
                title="Clear failed configuration and restore default baseline parameters (D=8, L=7, 85% retention)"
              >
                <RotateCcw className="w-4 h-4 text-[#7D776D]" />
                <span>{resetLabel || 'Full Reset to Defaults'}</span>
              </button>

              {/* 3. Re-Log to Console */}
              <button
                type="button"
                onClick={this.handleLogToConsoleAgain}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-white hover:bg-[#F2EFE9] text-[#252525] border border-[#D9DCD8] font-sans text-xs font-medium transition-colors cursor-pointer"
                title="Print error object, last valid configuration, and failure config into the browser console"
              >
                <FileCode className="w-3.5 h-3.5 text-[#21445B]" />
                <span>Re-Log to Console</span>
              </button>

              {/* 4. Diagnostic Trace Toggle */}
              <button
                type="button"
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-mono text-[#52504A] hover:text-[#252525] hover:bg-[#EAE6DF]/60 transition-colors ml-auto cursor-pointer"
              >
                <span>Diagnostic Trace & State JSON</span>
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Collapsible Technical Trace & State */}
            {showDetails && (
              <div className="mt-5 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#7D776D] font-bold uppercase tracking-wider">
                    Full Diagnostic Report (Error Object + State Configurations)
                  </span>
                  <button
                    type="button"
                    onClick={this.handleCopyDiagnostics}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-[#F2EFE9] border border-[#D9DCD8] text-xs font-mono text-[#52504A] transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied JSON Trace</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Diagnostic Report</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Shared State JSON */}
                  <div className="p-4 rounded-lg bg-[#191D24] text-[#E0E2DB] font-mono text-xs overflow-x-auto max-h-72 space-y-3">
                    <div>
                      <div className="text-[#38BDF8] pb-1 font-bold border-b border-[#2C3340] mb-1 flex items-center justify-between">
                        <span>Last Valid Config (Re-Executed on Retry):</span>
                        <span className="text-[10px] text-[#94A3B8]">InterferenceConfig</span>
                      </div>
                      <pre className="whitespace-pre text-[#A5F3FC]">
                        {JSON.stringify(configToRetry, null, 2)}
                      </pre>
                    </div>

                    {capturedConfig && (
                      <div>
                        <div className="text-[#FBBF24] pb-1 font-bold border-b border-[#2C3340] mb-1 flex items-center justify-between">
                          <span>Configuration at Interruption:</span>
                          <span className="text-[10px] text-[#94A3B8]">InterferenceConfig</span>
                        </div>
                        <pre className="whitespace-pre text-[#FDE68A]">
                          {JSON.stringify(capturedConfig, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Error Object Stack */}
                  <div className="p-4 rounded-lg bg-[#1F2421] text-[#E0E2DB] font-mono text-xs overflow-x-auto max-h-72 leading-relaxed space-y-2">
                    <div className="text-[#F5A623] font-bold pb-1 border-b border-[#333A35] mb-2">
                      Exception Stack Trace:
                    </div>
                    <div className="text-[#F87171]">{error?.stack || error?.message || 'No stack trace'}</div>
                    {errorInfo?.componentStack && (
                      <div className="text-[#8E9B90] pt-2 border-t border-[#333A35]">
                        {errorInfo.componentStack}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#7D776D] font-sans">
                  The &quot;Retry Last Operation&quot; button calls <span className="font-mono font-semibold">reexecuteLastValidExperiment()</span> to restore the verified deterministic parameters that succeeded prior to the exception.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        key: remountKey,
        ...(isRetrying && (capturedConfig || lastValidConfig)
          ? { initialConfig: lastValidConfig || capturedConfig }
          : {}),
      });
    }

    return <React.Fragment key={remountKey}>{children}</React.Fragment>;
  }
}

import { APIError } from './api-error';
import { RateLimiter } from './rate-limiter';

interface ErrorMetadata {
  code?: string;
  timestamp: number;
  context?: Record<string, unknown>;
}

type ErrorCallback = (error: Error, metadata: ErrorMetadata) => void;

export class ErrorHandler {
  private static errorCallbacks: ErrorCallback[] = [];
  private static rateLimiter = new RateLimiter(100, 60000); // 100 errors per minute
  private static readonly ERROR_PATTERNS = {
    NETWORK: /network|timeout|connection/i,
    AUTH: /unauthorized|forbidden|auth/i,
    VALIDATION: /validation|invalid|required/i,
    SENSITIVE: /(password|token|key|secret|credential)/i
  };

  static registerErrorCallback(callback: ErrorCallback): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    };
  }

  static handleError(error: unknown, context?: Record<string, unknown>): void {
    if (!this.rateLimiter.tryAcquire()) {
      // Log rate limit exceeded to monitoring service
      return;
    }

    const formattedError = this.formatError(error);
    const sanitizedError = this.sanitizeError(formattedError);
    const metadata = this.createErrorMetadata(sanitizedError, context);

    this.notifyCallbacks(sanitizedError, metadata);
    
    if (this.isNetworkError(sanitizedError)) {
      this.handleNetworkError(sanitizedError, metadata);
    } else if (this.isAuthError(sanitizedError)) {
      this.handleAuthError(sanitizedError, metadata);
    } else {
      this.handleGenericError(sanitizedError, metadata);
    }

    // Send to monitoring service
    this.logToMonitoring(sanitizedError, metadata);
  }

  private static formatError(error: unknown): Error {
    if (error instanceof Error) return error;
    return new Error(this.sanitizeErrorMessage(String(error)));
  }

  private static sanitizeError(error: Error): Error {
    const sanitizedMessage = this.sanitizeErrorMessage(error.message);
    const sanitizedError = new Error(sanitizedMessage);
    sanitizedError.stack = this.sanitizeErrorMessage(error.stack || '');
    return sanitizedError;
  }

  private static sanitizeErrorMessage(message: string): string {
    // Remove potential sensitive data
    return message.replace(this.ERROR_PATTERNS.SENSITIVE, '[REDACTED]');
  }

  private static createErrorMetadata(error: Error, context?: Record<string, unknown>): ErrorMetadata {
    return {
      code: this.determineErrorCode(error),
      timestamp: Date.now(),
      context: this.sanitizeContext(context || {})
    };
  }

  private static sanitizeContext(context: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(context)) {
      if (this.ERROR_PATTERNS.SENSITIVE.test(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  private static determineErrorCode(error: Error): string {
    if (this.isNetworkError(error)) return 'NETWORK_ERROR';
    if (this.isAuthError(error)) return 'AUTH_ERROR';
    if (error instanceof APIError) return error.code;
    return 'UNKNOWN_ERROR';
  }

  private static notifyCallbacks(error: Error, metadata: ErrorMetadata): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error, metadata);
      } catch (callbackError) {
        // Log callback error to monitoring service
        this.logToMonitoring(callbackError, {
          code: 'CALLBACK_ERROR',
          timestamp: Date.now(),
          context: { originalError: error.message }
        });
      }
    });
  }

  private static isNetworkError(error: Error): boolean {
    return this.ERROR_PATTERNS.NETWORK.test(error.message);
  }

  private static isAuthError(error: Error): boolean {
    return this.ERROR_PATTERNS.AUTH.test(error.message);
  }

  private static handleNetworkError(error: Error, metadata: ErrorMetadata): void {
    // Implement retry logic or offline mode
    this.logToMonitoring(error, { ...metadata, severity: 'warning' });
  }

  private static handleAuthError(error: Error, metadata: ErrorMetadata): void {
    // Clear sensitive data and redirect to login
    localStorage.clear();
    sessionStorage.clear();
    this.logToMonitoring(error, { ...metadata, severity: 'error' });
    window.location.href = '/login';
  }

  private static handleGenericError(error: Error, metadata: ErrorMetadata): void {
    this.logToMonitoring(error, { ...metadata, severity: 'error' });
  }

  private static logToMonitoring(error: Error, metadata: ErrorMetadata): void {
    // Integration with monitoring service (e.g., Sentry, LogRocket)
    const monitoringData = {
      error: {
        message: error.message,
        stack: error.stack,
        ...metadata
      },
      level: metadata.severity || 'error',
      timestamp: metadata.timestamp
    };

    // Send to monitoring service
    // monitoringService.log(monitoringData);
  }
}
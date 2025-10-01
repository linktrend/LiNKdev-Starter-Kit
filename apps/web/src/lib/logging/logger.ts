/**
 * Centralized logging utility
 * Provides structured logging with different levels and contexts
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  service?: string;
  operation?: string;
  userId?: string;
  orgId?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';

  private formatMessage(entry: LogEntry): string {
    const { level, message, context, timestamp, error } = entry;
    
    let formatted = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (context) {
      const contextStr = Object.entries(context)
        .map(([key, value]) => `${key}=${value}`)
        .join(' ');
      formatted += ` | ${contextStr}`;
    }
    
    if (error) {
      formatted += ` | Error: ${error.message}`;
      if (this.isDevelopment) {
        formatted += `\nStack: ${error.stack}`;
      }
    }
    
    return formatted;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isTest) {
      // In tests, only log errors
      return level === 'error';
    }
    
    if (this.isDevelopment) {
      // In development, log everything
      return true;
    }
    
    // In production, log warn and error only
    return level === 'warn' || level === 'error';
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      error,
    };

    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case 'debug':
        console.debug(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
    }

    // In production, you might want to send logs to a service like Sentry, DataDog, etc.
    if (!this.isDevelopment && !this.isTest && level === 'error') {
      // Example: Send to external logging service
      // this.sendToLoggingService(entry);
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log('error', message, context, error);
  }

  // Convenience methods for common patterns
  audit(action: string, context: LogContext): void {
    this.info(`AUDIT: ${action}`, context);
  }

  service(service: string, operation: string, message: string, context?: Omit<LogContext, 'service' | 'operation'>): void {
    this.info(message, { service, operation, ...context });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const { debug, info, warn, error, audit, service } = logger;

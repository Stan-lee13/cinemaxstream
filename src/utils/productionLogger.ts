/**
 * Production-ready logging system
 * Replaces all console.log/console.error statements
 */

import { ErrorReport, AnalyticsEvent } from '@/types/production';
import { errorReporter } from './errorReporting';
import { analytics } from './analytics';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: number;
  component?: string;
}

class ProductionLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private isDev = import.meta.env.DEV;

  debug(message: string, context?: Record<string, unknown>, component?: string) {
    this.log(LogLevel.DEBUG, message, context, component);
  }

  info(message: string, context?: Record<string, unknown>, component?: string) {
    this.log(LogLevel.INFO, message, context, component);
  }

  warn(message: string, context?: Record<string, unknown>, component?: string) {
    this.log(LogLevel.WARN, message, context, component);
  }

  error(message: string, context?: Record<string, unknown>, component?: string) {
    this.log(LogLevel.ERROR, message, context, component);
  }

  critical(message: string, context?: Record<string, unknown>, component?: string) {
    this.log(LogLevel.CRITICAL, message, context, component);
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, component?: string) {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: Date.now(),
      component
    };

    // Add to internal log store
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // In development, still use console
    if (this.isDev) {
      const logMethod = this.getConsoleMethod(level);
      if (context) {
        logMethod(`[${component || 'Unknown'}] ${message}`, context);
      } else {
        logMethod(`[${component || 'Unknown'}] ${message}`);
      }
    }

    // In production, send to external service
    if (!this.isDev && level >= LogLevel.ERROR) {
      this.sendToMonitoringService(entry);
    }
  }

  private getConsoleMethod(level: LogLevel) {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        return console.error;
      default:
        return console.log;
    }
  }

  private async sendToMonitoringService(entry: LogEntry) {
    try {
      // Build an ErrorReport and use the centralized error reporter
      const errorReport: ErrorReport = {
        message: entry.message,
        component: entry.component || 'Unknown',
        timestamp: entry.timestamp,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        severity: this.mapLevelToSeverity(entry.level),
        context: { 
          component: entry.component || 'Unknown',
          action: 'log',
          metadata: { level: entry.level, ...entry.context }
        }
      };

      // Use errorReporter singleton. If reportError is async, await it.
      try {
        const result = (errorReporter as unknown as { reportError?: (e: unknown) => unknown }).reportError?.(errorReport as unknown);
        if (result && typeof (result as Promise<unknown>)?.then === 'function') {
          await result as Promise<unknown>;
        }
      } catch {
        // ignore reporter failures
      }

      // Send a performance/analytics event for higher severity logs
      if (analytics && (entry.level === LogLevel.ERROR || entry.level === LogLevel.CRITICAL)) {
        analytics.trackError(new Error(entry.message), entry.component);
      }
    } catch (err) {
      // Fallback - only log critical errors to console in production
      if (entry.level === LogLevel.CRITICAL) {
        console.error('Critical error:', entry.message, entry.context);
      }
    }
  }

  private mapLevelToSeverity(level: LogLevel): ErrorReport['severity'] {
    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        return 'low';
      case LogLevel.WARN:
        return 'medium';
      case LogLevel.ERROR:
        return 'high';
      case LogLevel.CRITICAL:
        return 'critical';
      default:
        return 'medium';
    }
  }

  getLogs(minLevel: LogLevel = LogLevel.INFO): LogEntry[] {
    return this.logs.filter(log => log.level >= minLevel);
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new ProductionLogger();

// Convenience functions to replace console.log throughout the app
export const logDebug = (message: string, context?: Record<string, unknown>, component?: string) => 
  logger.debug(message, context, component);

export const logInfo = (message: string, context?: Record<string, unknown>, component?: string) => 
  logger.info(message, context, component);

export const logWarn = (message: string, context?: Record<string, unknown>, component?: string) => 
  logger.warn(message, context, component);

export const logError = (message: string, context?: Record<string, unknown>, component?: string) => 
  logger.error(message, context, component);

export const logCritical = (message: string, context?: Record<string, unknown>, component?: string) => 
  logger.critical(message, context, component);
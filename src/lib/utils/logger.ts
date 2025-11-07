/**
 * Conditional Logger Utility
 *
 * Provides debug logging that can be disabled in production.
 * Uses feature flags to determine if logs should be shown.
 */

import { featureFlags } from '@/lib/config/features';

class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private shouldLog(): boolean {
    return featureFlags.enableDebugLogs;
  }

  private formatMessage(message: string, ...args: unknown[]): unknown[] {
    return [`[${this.context}] ${message}`, ...args];
  }

  log(message: string, ...args: unknown[]): void {
    if (this.shouldLog()) {
      console.log(...this.formatMessage(message, ...args));
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog()) {
      console.warn(...this.formatMessage(message, ...args));
    }
  }

  error(message: string, ...args: unknown[]): void {
    // Always log errors, even in production
    console.error(...this.formatMessage(message, ...args));
  }
}

/**
 * Create a logger instance for a specific context
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

/**
 * Server-side logger for PartyKit
 * Checks NODE_ENV directly since feature flags may not be available
 */
export class ServerLogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private shouldLog(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  private formatMessage(message: string, ...args: unknown[]): unknown[] {
    return [`[${this.context}] ${message}`, ...args];
  }

  log(message: string, ...args: unknown[]): void {
    if (this.shouldLog()) {
      console.log(...this.formatMessage(message, ...args));
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog()) {
      console.warn(...this.formatMessage(message, ...args));
    }
  }

  error(message: string, ...args: unknown[]): void {
    // Always log errors
    console.error(...this.formatMessage(message, ...args));
  }
}

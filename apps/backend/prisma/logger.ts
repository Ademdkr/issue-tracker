/**
 * Simple Logger Utility for CLI Scripts
 *
 * Provides structured logging for Prisma scripts (seed, export, etc.)
 * without requiring NestJS dependencies.
 */

export class Logger {
  private context: string;

  constructor(context = 'Script') {
    this.context = context;
  }

  /**
   * Log informational message
   */
  log(message: string): void {
    const timestamp = new Date().toISOString();
    process.stdout.write(`[${timestamp}] [${this.context}] ${message}\n`);
  }

  /**
   * Log success message with green checkmark
   */
  success(message: string): void {
    const timestamp = new Date().toISOString();
    process.stdout.write(`[${timestamp}] [${this.context}] ✓ ${message}\n`);
  }

  /**
   * Log error message
   */
  error(message: string, error?: unknown): void {
    const timestamp = new Date().toISOString();
    process.stderr.write(`[${timestamp}] [${this.context}] ❌ ${message}\n`);
    if (error) {
      process.stderr.write(
        `[${timestamp}] [${this.context}] ${this.formatError(error)}\n`
      );
    }
  }

  /**
   * Log warning message
   */
  warn(message: string): void {
    const timestamp = new Date().toISOString();
    process.stdout.write(`[${timestamp}] [${this.context}] ⚠️  ${message}\n`);
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string): void {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      process.stdout.write(`[${timestamp}] [${this.context}] 🐛 ${message}\n`);
    }
  }

  /**
   * Format error object for logging
   */
  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return `${error.message}\n${error.stack || ''}`;
    }
    return String(error);
  }

  /**
   * Create a separator line
   */
  separator(): void {
    process.stdout.write(
      '============================================================\n'
    );
  }

  /**
   * Log a section header
   */
  section(title: string, emoji = '📋'): void {
    process.stdout.write(`\n${emoji} ${title}\n`);
  }
}

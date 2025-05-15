import { storage } from './storage';

export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

export interface LogOptions {
  userId?: number | null;
  feature?: string | null;
  metadata?: any;
}

/**
 * Unified logging system that logs to console and database
 */
class Logger {
  /**
   * Log an error message
   * @param message Error message to log
   * @param component System component where the error occurred
   * @param options Additional log options
   */
  async error(message: string, component: string, options: LogOptions = {}) {
    console.error(`[ERROR][${component}] ${message}`);
    await this.logToDatabase('ERROR', message, component, options);
  }

  /**
   * Log a warning message
   * @param message Warning message to log
   * @param component System component where the warning occurred
   * @param options Additional log options
   */
  async warn(message: string, component: string, options: LogOptions = {}) {
    console.warn(`[WARN][${component}] ${message}`);
    await this.logToDatabase('WARN', message, component, options);
  }

  /**
   * Log an info message
   * @param message Info message to log
   * @param component System component where the info originated
   * @param options Additional log options
   */
  async info(message: string, component: string, options: LogOptions = {}) {
    console.info(`[INFO][${component}] ${message}`);
    await this.logToDatabase('INFO', message, component, options);
  }

  /**
   * Log a debug message (only to console in development)
   * @param message Debug message to log
   * @param component System component where the debug message originated
   * @param options Additional log options
   */
  async debug(message: string, component: string, options: LogOptions = {}) {
    console.debug(`[DEBUG][${component}] ${message}`);
    
    // Only log debug messages to database in development
    if (process.env.NODE_ENV === 'development') {
      await this.logToDatabase('DEBUG', message, component, options);
    }
  }

  /**
   * Record API usage statistics
   * @param service The service being used (transcription, translation, etc)
   * @param endpoint The API endpoint being called
   * @param responseTimeMs Response time in milliseconds
   * @param success Whether the request was successful
   * @param options Additional options like user ID and error message
   */
  async logApiUsage(
    service: string, 
    endpoint: string, 
    responseTimeMs: number, 
    success: boolean, 
    options: {
      userId?: number | null;
      errorMessage?: string | null;
      requestSize?: number;
      responseSize?: number;
    } = {}
  ) {
    try {
      // Here we would typically insert into the api_usage table
      // For demonstration purposes, we'll log to the console
      console.info(`[API USAGE] ${service}::${endpoint} ${success ? 'SUCCESS' : 'FAILED'} ${responseTimeMs}ms`);
      
      // 1. Insert into api_usage table for analytics
      try {
        await storage.logApiCall({
          service,
          endpoint,
          responseTimeMs,
          success,
          errorMessage: options.errorMessage || null,
          userId: options.userId,
          requestSize: options.requestSize,
          responseSize: options.responseSize
        });
      } catch (error) {
        console.error('Failed to log API usage to database:', error);
      }
      
      // 2. Log API calls to system logs table 
      if (success) {
        // Log successful API calls to system logs
        await this.info(
          `API call successful (${responseTimeMs}ms)`,
          `API:${service}`,
          {
            userId: options.userId,
            feature: service,
            metadata: { 
              endpoint, 
              responseTime: responseTimeMs,
              requestSize: options.requestSize,
              responseSize: options.responseSize
            }
          }
        );
      } else if (options.errorMessage) {
        // Log errors to system logs table (already implemented)
        await this.error(
          options.errorMessage,
          `API:${service}`,
          {
            userId: options.userId,
            feature: service,
            metadata: { 
              endpoint, 
              responseTime: responseTimeMs,
              requestSize: options.requestSize,
              responseSize: options.responseSize
            }
          }
        );
      }
    } catch (err) {
      console.error('Failed to log API usage:', err);
    }
  }

  /**
   * Save log message to database
   */
  private async logToDatabase(
    level: LogLevel,
    message: string,
    component: string,
    options: LogOptions = {}
  ) {
    try {
      await storage.logSystemEvent({
        level,
        message,
        component,
        userId: options.userId || null,
        feature: options.feature || null,
        metadata: options.metadata || null
      });
    } catch (err) {
      // If database logging fails, at least we have console logs
      console.error('Failed to write log to database:', err);
    }
  }
}

// Export singleton instance
export const logger = new Logger();
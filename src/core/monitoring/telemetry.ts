/**
 * Telemetry details structure for logging application events.
 */
export interface TelemetryEvent {
  name: string;
  category: 'performance' | 'error' | 'click' | 'database' | 'checkout';
  metadata?: Record<string, unknown>;
}

/**
 * Telemetry service logs performance metrics and handles runtime errors.
 */
export class Telemetry {
  /**
   * Tracks custom telemetry events.
   */
  static logEvent(event: TelemetryEvent): void {
    const timestamp = new Date().toISOString();
    
    // Log to console in development environment
    if (process.env.NODE_ENV === 'development') {
      console.info(
        `[Telemetry - ${timestamp}] Name: "${event.name}" | Category: "${event.category}"`,
        event.metadata ? event.metadata : ''
      );
    }
    
    // Future integration hooks (e.g. Sentry, Datadog, Mixpanel) can be added here
  }

  /**
   * Logs runtime errors.
   */
  static logError(error: Error, context?: string, metadata?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    
    console.error(
      `[Telemetry Error - ${timestamp}] Context: "${context || 'App Runtime'}" | Message: "${error.message}"`,
      {
        stack: error.stack,
        ...metadata,
      }
    );
  }

  /**
   * Logs slow database queries or API timings.
   */
  static logTiming(name: string, durationMs: number, thresholdMs = 500): void {
    if (durationMs > thresholdMs) {
      this.logEvent({
        name: `${name}_slow_timing`,
        category: 'performance',
        metadata: {
          durationMs,
          thresholdMs,
          message: `Warning: "${name}" took ${durationMs}ms which exceeds the budget threshold of ${thresholdMs}ms.`,
        },
      });
    }
  }
}
export default Telemetry;

import { appConfig } from '../config/app';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private formatMessage(level: LogLevel, message: string, meta?: unknown) {
    const timestamp = new Date().toISOString();
    return JSON.stringify({
      timestamp,
      level,
      message,
      meta,
      environment: appConfig.env,
    });
  }

  public debug(message: string, meta?: unknown) {
    if (!appConfig.isProduction) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  public info(message: string, meta?: unknown) {
    console.info(this.formatMessage('info', message, meta));
  }

  public warn(message: string, meta?: unknown) {
    console.warn(this.formatMessage('warn', message, meta));
  }

  public error(message: string, meta?: unknown) {
    console.error(this.formatMessage('error', message, meta));
  }
}

export const logger = new Logger();
export default logger;

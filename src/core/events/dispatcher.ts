import { logger } from '../logger';

type EventCallback<T = unknown> = (data: T) => void | Promise<void>;

class EventDispatcher {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners: Record<string, EventCallback<any>[]> = {};

  public subscribe<T = unknown>(event: string, callback: EventCallback<T>) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.unsubscribe(event, callback);
  }

  public unsubscribe<T = unknown>(event: string, callback: EventCallback<T>) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  }

  public async dispatch<T = unknown>(event: string, data: T): Promise<void> {
    logger.info(`[EVENT] Dispatching event: ${event}`, { event, data });
    if (!this.listeners[event]) return;

    const promises = this.listeners[event].map(async (callback) => {
      try {
        await callback(data);
      } catch (err) {
        logger.error(`Error in event listener for ${event}:`, err);
      }
    });

    await Promise.all(promises);
  }
}

export const eventDispatcher = new EventDispatcher();
export default eventDispatcher;

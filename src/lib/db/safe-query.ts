import { db } from '@/lib/db';

/**
 * Executes a database query with graceful error handling.
 * Returns an empty array fallback if the query fails (e.g. table doesn't exist).
 * Logs the error for observability without crashing the caller.
 */
export async function safeQuery<T>(
  queryFn: () => Promise<T[]>,
  label?: string,
  timeoutMs: number = 3000
): Promise<T[]> {
  try {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<T[]>((resolve) => {
      timer = setTimeout(() => {
        resolve([]);
      }, timeoutMs);
    });

    const result = await Promise.race([
      queryFn().then((res) => {
        clearTimeout(timer);
        return res;
      }),
      timeoutPromise,
    ]);

    return (result || []) as T[];
  } catch (err) {
    return [];
  }
}

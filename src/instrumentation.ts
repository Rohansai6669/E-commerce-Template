/**
 * Next.js Server Lifecycle Instrumentation hook.
 * Handles Node.js 22 upstream WebStreams TransformStream race conditions gracefully.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    process.on('unhandledRejection', (reason: unknown) => {
      const err = reason as { message?: string; stack?: string };
      const msg = err?.message || '';
      const stack = err?.stack || '';
      if (
        msg.includes('transformAlgorithm') ||
        stack.includes('transformAlgorithm') ||
        msg.includes('TransformStream')
      ) {
        // Gracefully suppress upstream Node.js 22 Web Streams abort race condition
        return;
      }
    });
  }
}


import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: Record<string, unknown>;
}

export class HttpResponse {
  public static success<T>(data: T, status = 200, meta?: Record<string, unknown>) {
    const body: ApiResponse<T> = {
      success: true,
      data,
      meta,
    };
    return NextResponse.json(body, { status });
  }

  public static error(message: string, code = 'BAD_REQUEST', status = 400, details?: unknown) {
    const body: ApiResponse<never> = {
      success: false,
      error: {
        code,
        message,
        details,
      },
    };
    return NextResponse.json(body, { status });
  }

  public static unauthorized(message = 'Unauthorized') {
    return this.error(message, 'UNAUTHORIZED', 401);
  }

  public static forbidden(message = 'Forbidden') {
    return this.error(message, 'FORBIDDEN', 403);
  }

  public static notFound(message = 'Resource not found') {
    return this.error(message, 'NOT_FOUND', 404);
  }

  public static internalServerError(message = 'Internal server error') {
    return this.error(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}

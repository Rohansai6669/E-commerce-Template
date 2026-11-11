import { z } from 'zod';
import { AppError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError } from '@/core/errors';
import { createClient } from '@/lib/supabase/server';
import { type SupabaseClient } from '@supabase/supabase-js';

/**
 * Constrained error codes for predictable error handling in UI.
 */
export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

/**
 * Standardized result shape for Server Actions.
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: ErrorCode; message: string } };

export interface ActionOptions {
  requireAuth?: boolean;
  requiredRole?: 'customer' | 'staff' | 'admin' | 'vendor';
  requiredRoles?: ('customer' | 'staff' | 'admin' | 'vendor')[];
}

/**
 * Reusable wrapper to define safe Server Actions.
 * Handles validation, authentication, authorization, logging, and error mapping.
 */
export function createSafeAction<TInput, TResult>(
  schema: z.Schema<TInput>,
  options: ActionOptions,
  handler: (
    input: TInput,
    ctx: { userId: string | null; userRole: string | null; supabase: SupabaseClient }
  ) => Promise<TResult>
): (input: TInput) => Promise<ActionResult<TResult>> {
  return async (input: TInput): Promise<ActionResult<TResult>> => {
    try {
      // 1. Input Validation (Zod)
      const parsed = schema.safeParse(input);
      if (!parsed.success) {
        throw new ValidationError(
          'Validation failed',
          parsed.error.format() as unknown as Record<string, unknown>
        );
      }

      const supabase = await createClient();
      let userId: string | null = null;
      let userRole: string | null = null;

      // Fetch user session if auth/role check is required or requested
      const requireCheck = options.requireAuth || options.requiredRole || options.requiredRoles;
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (requireCheck && (authError || !user)) {
        throw new AuthenticationError('Authentication required. Please log in.');
      }

      if (user) {
        userId = user.id;

        // Fetch user profile to extract role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile) {
          userRole = profile.role as string;
        }
      }

      // 2. Authorization Checks
      if (requireCheck && userId) {
        const requiredRoles = options.requiredRoles || (options.requiredRole ? [options.requiredRole] : []);
        
        if (requiredRoles.length > 0) {
          // Admin has automatic bypass for all role checks
          const isAuthorized = userRole === 'admin' || (userRole && requiredRoles.includes(userRole as 'customer' | 'staff' | 'admin' | 'vendor'));
          if (!isAuthorized) {
            throw new AuthorizationError('Access denied. Insufficient permissions.');
          }
        }
      }

      // 3. Execute handler
      const result = await handler(parsed.data, { userId, userRole, supabase });
      return { success: true, data: result };

    } catch (error: unknown) {
      // 4. Logging & Error Mapping
      console.error('❌ Server Action Error:', error);

      if (error instanceof ValidationError) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        };
      }

      if (error instanceof AuthenticationError) {
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: error.message,
          },
        };
      }

      if (error instanceof AuthorizationError) {
        return {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: error.message,
          },
        };
      }

      if (error instanceof NotFoundError) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        };
      }

      if (error instanceof AppError) {
        // Map other custom app-specific errors
        let mappedCode: ErrorCode = 'INTERNAL_ERROR';
        if (error.code === 'CONFLICT_ERROR') mappedCode = 'CONFLICT';

        return {
          success: false,
          error: {
            code: mappedCode,
            message: error.message,
          },
        };
      }

      // Fallback for unexpected errors (raw DB, network, etc.)
      const message = error instanceof Error ? error.message : 'An unexpected server error occurred.';
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message,
        },
      };
    }
  };
}

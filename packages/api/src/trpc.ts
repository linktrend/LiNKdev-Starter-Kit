import { initTRPC, TRPCError } from '@trpc/server';
import SuperJSON from 'superjson';
import type { UsageLogPayload } from '@starter/types';

// Define the context type that will be provided by the consuming application
export type UsageLogger = (payload: UsageLogPayload) => void | Promise<void>;

export interface TRPCContext {
  supabase: any;
  user: any;
  posthog?: any;
  headers?: Headers;
  usageLogger?: UsageLogger;
  // RBAC context - populated by accessGuard middleware
  userRole?: string;
  orgId?: string;
}

function safeUsageLog(logger: UsageLogger | undefined, payload: UsageLogPayload) {
  if (!logger) return;
  try {
    const result = logger(payload);
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      (result as Promise<unknown>).catch((error) => {
        console.error('Usage logging failed', error);
      });
    }
  } catch (error) {
    console.error('Usage logging threw synchronously', error);
  }
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: SuperJSON,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure
  .use(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  })
  .use(({ ctx, next, path }) => {
    if (ctx.user) {
      safeUsageLog(ctx.usageLogger, {
        userId: ctx.user.id,
        orgId: ctx.orgId,
        eventType: 'api_call',
        metadata: { procedure: path },
      } satisfies UsageLogPayload);
    }
    return next();
  });

// Export the context type

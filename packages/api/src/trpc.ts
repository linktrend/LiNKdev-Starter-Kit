import { initTRPC, TRPCError } from '@trpc/server';
import SuperJSON from 'superjson';
import type { UsageLogPayload } from '@starter/types';
import type { TRPCContext, UsageLogger } from './context';

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

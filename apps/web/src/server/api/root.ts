import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import SuperJSON from 'superjson';
import { createTRPCContext } from './trpc';
import { orgRouter } from '../routers/org';
import { recordsRouter } from '../routers/records';
import { schedulingRouter } from '../routers/scheduling';
import { automationRouter } from '../routers/automation';
import { billingRouter } from '../routers/billing';
import { auditRouter } from '../routers/audit';
import { createIdempotencyAndRateLimitMiddleware } from '../rest/middleware';

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: SuperJSON,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Create middleware instances
const idempotencyAndRateLimitMiddleware = createIdempotencyAndRateLimitMiddleware();

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
  .use(idempotencyAndRateLimitMiddleware);

export const appRouter = createTRPCRouter({
  status: publicProcedure.query(() => ({ ok: true })),
  posts: createTRPCRouter({
    getAll: publicProcedure.query(() => [
      { id: '1', title: 'Sample Post', content: 'This is a sample post', created_at: new Date().toISOString() }
    ]),
    create: publicProcedure.input(z.object({ title: z.string(), content: z.string() })).mutation(({ input }) => ({ 
      id: Math.random().toString(36).substr(2, 9), 
      title: input.title, 
      content: input.content,
      created_at: new Date().toISOString()
    })),
    update: publicProcedure.input(z.object({ id: z.string(), title: z.string(), content: z.string() })).mutation(({ input }) => ({ 
      id: input.id, 
      title: input.title, 
      content: input.content,
      created_at: new Date().toISOString()
    })),
    delete: publicProcedure.input(z.object({ id: z.string() })).mutation(() => ({ success: true }))
  }),
    org: orgRouter,
    records: recordsRouter,
    scheduling: schedulingRouter,
    automation: automationRouter,
    billing: billingRouter,
    audit: auditRouter,
});

export type AppRouter = typeof appRouter;
export default appRouter;

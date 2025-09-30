import { initTRPC, TRPCError } from '@trpc/server';
import SuperJSON from 'superjson';

// Define the context type that will be provided by the consuming application
export interface TRPCContext {
  supabase: any;
  user: any;
  posthog?: any;
  headers?: Headers;
  // RBAC context - populated by accessGuard middleware
  userRole?: string;
  orgId?: string;
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
  });

// Export the context type

import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from './trpc';
import { orgRouter } from './routers/org';
import { recordsRouter } from './routers/records';
import { schedulingRouter } from './routers/scheduling';
import { automationRouter } from './routers/automation';
import { billingRouter } from './routers/billing';
import { auditRouter } from './routers/audit';
import { flagsRouter } from './routers/flags';

// Note: Email dispatcher will be imported by the consuming application
declare const sendTestEmail: (to: string, data: any) => Promise<void>;

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
  flags: flagsRouter,
  
  // Email testing endpoint
  email: createTRPCRouter({
    sendTest: protectedProcedure
      .input(z.object({
        to: z.string().email('Invalid email address'),
        message: z.string().optional().default('Hello from LTM Starter Kit!'),
      }))
      .mutation(async ({ input }) => {
        try {
          await sendTestEmail(input.to, {
            message: input.message,
            timestamp: new Date().toISOString(),
          });
          
          return { 
            success: true, 
            message: 'Test email sent successfully. Check console for output.' 
          };
        } catch (error) {
          console.error('Failed to send test email:', error);
          throw new Error('Failed to send test email');
        }
      }),
  }),
});

// Export the router type explicitly to avoid type collision issues
export type AppRouter = typeof appRouter;

// Create caller for server-side usage
export const createCaller = (ctx: any): ReturnType<typeof appRouter.createCaller> => appRouter.createCaller(ctx);

export default appRouter;

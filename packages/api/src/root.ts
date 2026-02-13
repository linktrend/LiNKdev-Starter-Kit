import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from './trpc';
import { organizationRouter } from './routers/organization';
import { userRouter } from './routers/user';
import { profileRouter } from './routers/profile';
import { recordsRouter } from './routers/records';
import { schedulingRouter } from './routers/scheduling';
import { automationRouter } from './routers/automation';
import { billingRouter } from './routers/billing';
import { auditRouter } from './routers/audit';
import { usageRouter } from './routers/usage';
import { flagsRouter } from './routers/flags';
import { developmentTasksRouter } from './routers/developmentTasks';
import { notificationsRouter } from './routers/notifications';
import { settingsRouter } from './routers/settings';
import { teamRouter } from './routers/team';

// Note: Email dispatcher will be imported by the consuming application
declare const sendTestEmail: (to: string, data: any) => Promise<void>;

const _appRouter = createTRPCRouter({
  status: publicProcedure.query(() => ({ ok: true })),
  organization: organizationRouter,
  user: userRouter,
  profile: profileRouter,
  records: recordsRouter,
  scheduling: schedulingRouter,
  automation: automationRouter,
  billing: billingRouter,
  audit: auditRouter,
  usage: usageRouter,
  flags: flagsRouter,
  developmentTasks: developmentTasksRouter,
  notifications: notificationsRouter,
  settings: settingsRouter,
  team: teamRouter,
  
  // Email testing endpoint
  email: createTRPCRouter({
    sendTest: protectedProcedure
      .input(z.object({
        to: z.string().email('Invalid email address'),
        message: z.string().optional().default('Hello from LiNKdev Starter Kit!'),
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

// Export the router with explicit type annotation to help declaration generation
export const appRouter: typeof _appRouter = _appRouter;

// Export the router type explicitly to avoid type collision issues
export type AppRouter = typeof _appRouter;

// Create caller for server-side usage
export const createCaller = (ctx: any): ReturnType<typeof appRouter.createCaller> => appRouter.createCaller(ctx);

export default appRouter;

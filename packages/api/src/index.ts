// Main API exports
export { appRouter, createCaller } from './root';
export type { AppRouter } from './root';
export { createTRPCRouter, publicProcedure, protectedProcedure } from './trpc';
export type { TRPCContext } from './trpc';

// Router exports
export { orgRouter } from './routers/org';
export { recordsRouter } from './routers/records';
export { schedulingRouter } from './routers/scheduling';
export { automationRouter } from './routers/automation';
export { billingRouter } from './routers/billing';
export { auditRouter } from './routers/audit';

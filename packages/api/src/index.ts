// Main API exports
export { appRouter, createCaller } from './root';
export type { AppRouter } from './root';
export { createTRPCRouter, publicProcedure, protectedProcedure } from './trpc';
export type { TRPCContext, UsageLogger } from './context';

// RBAC exports
export * from './rbac';
export * from './middleware/accessGuard';

// Router exports
export { organizationRouter } from './routers/organization';
export { userRouter } from './routers/user';
export { profileRouter } from './routers/profile';
export { recordsRouter } from './routers/records';
export { schedulingRouter } from './routers/scheduling';
export { automationRouter } from './routers/automation';
export { billingRouter } from './routers/billing';
export { auditRouter } from './routers/audit';
export { flagsRouter } from './routers/flags';

// Type alias to force proper resolution of AppRouter
import { appRouter } from "@starter/api";

// This alias forces TypeScript to resolve the recursive type correctly
export type AppRouter = typeof appRouter;

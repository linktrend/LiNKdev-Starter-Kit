import "server-only";

import { createTRPCReact } from "@trpc/react-query";
import { headers } from "next/headers";
// import { cache } from "react"; // Not available in React 18

import { createCaller, appRouter } from "@starter/api";
import type { AppRouter } from "./types";
import { createTRPCContext } from "@/server/api/trpc";
import { createQueryClient } from "./query-client";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = () => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
};

const getQueryClient = createQueryClient;
const caller = createCaller(createContext);

// Create tRPC React hooks for server-side usage
const api = createTRPCReact<AppRouter>();

export { api, caller };

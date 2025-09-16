"use client";
import { useEffect } from "react";
import { initSentry, Sentry } from "@/lib/observability/sentry";
export default function Page(){
  useEffect(()=>{ initSentry(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN, process.env.SENTRY_ENVIRONMENT); },[]);
  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Sentry Debug</h1>
      <button className="px-4 py-2 rounded-xl border" onClick={()=>{ try{ throw new Error("Sentry test error"); } catch(e){ Sentry.captureException(e); } }}>Trigger Sentry Error</button>
    </main>
  );
}

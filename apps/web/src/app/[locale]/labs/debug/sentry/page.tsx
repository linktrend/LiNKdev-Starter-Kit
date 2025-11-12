"use client";
import { useEffect } from "react";
import { initSentry, Sentry } from "@/lib/observability/sentry";

export default function Page() {
  useEffect(() => {
    // Initialize Sentry with environment variables
    initSentry();
  }, []);

  const handleTestError = () => {
    try {
      throw new Error("Sentry test error");
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Sentry Debug</h1>
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          DSN: {process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || 'Not configured'}
        </p>
        <p className="text-sm text-gray-600">
          Environment: {process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'Not configured'}
        </p>
      </div>
      <button 
        className="px-4 py-2 rounded-xl border hover:bg-gray-50" 
        onClick={handleTestError}
      >
        Trigger Sentry Error
      </button>
    </main>
  );
}

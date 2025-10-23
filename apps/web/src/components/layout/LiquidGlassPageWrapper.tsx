'use client';

import { ReactNode } from 'react';

interface LiquidGlassPageWrapperProps {
  children: ReactNode;
}

export function LiquidGlassPageWrapper({ children }: LiquidGlassPageWrapperProps) {
  return (
    <div className="relative min-h-screen">
      {/* Background Image Container - z-0 */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%), url('/images/gradient-background.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      
      {/* Dark Overlay - z-0 */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: "rgba(0, 0, 0, 0.15)",
        }}
      />
      
      {/* Floating glass orbs for visual interest - z-0 */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full opacity-50 animate-pulse"
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(20px) saturate(180%)",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 8px 32px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
          }}
        />
        <div
          className="absolute top-3/4 right-1/4 w-24 h-24 rounded-full opacity-40 animate-pulse delay-1000"
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(20px) saturate(180%)",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 8px 32px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
          }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-16 h-16 rounded-full opacity-45 animate-pulse delay-500"
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(20px) saturate(180%)",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 8px 32px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
          }}
        />
      </div>

      {/* Main content - z-10 to appear above background */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

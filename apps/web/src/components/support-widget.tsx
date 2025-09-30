'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SupportWidget - Mock customer support widget component
 * 
 * This component renders a fixed chat bubble icon in the bottom-right corner
 * and logs initialization with the current organization context.
 * 
 * @param orgId - Optional organization ID for context logging
 */
interface SupportWidgetProps {
  orgId?: string | null;
  className?: string;
}

export function SupportWidget({ orgId, className }: SupportWidgetProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Simulate initialization and log to console
    const orgContext = orgId || 'unknown';
    console.log(`Support Widget Initialized for Org: ${orgContext}`);
    setIsInitialized(true);
  }, [orgId]);

  if (!isInitialized) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'flex items-center justify-center',
        'w-14 h-14 rounded-full',
        'bg-primary text-primary-foreground',
        'shadow-lg hover:shadow-xl',
        'cursor-pointer transition-all duration-200',
        'hover:scale-105 active:scale-95',
        'border-2 border-primary/20',
        className
      )}
      role="button"
      tabIndex={0}
      aria-label="Open customer support chat"
      onClick={() => {
        console.log('Support Widget clicked - would open chat interface');
        // Future: Open chat modal or redirect to support
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          console.log('Support Widget activated via keyboard - would open chat interface');
        }
      }}
    >
      <MessageCircle className="w-6 h-6" />
    </div>
  );
}

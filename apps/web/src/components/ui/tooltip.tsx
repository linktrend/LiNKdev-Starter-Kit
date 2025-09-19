import * as React from "react";
import { cn } from "@/lib/utils";

export function Tooltip({ children }: { children: React.ReactNode }) { 
  return <>{children}</>; 
}

export function TooltipTrigger({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean } & React.HTMLAttributes<HTMLElement>) { 
  return <>{children}</>; 
}

export function TooltipContent({ children, side, className, ...props }: { 
  children: React.ReactNode; 
  side?: string;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) { 
  return (
    <div
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      {children}
    </div>
  ); 
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default Tooltip;

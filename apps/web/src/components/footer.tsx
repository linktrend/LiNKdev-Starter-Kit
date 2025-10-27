import Link from 'next/link';
import { Droplets } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Footer() {
  return (
    <footer className={cn(
      'w-full mt-16 py-8 px-4',
      'bg-glass-light dark:bg-glass-dark backdrop-blur-glass backdrop-saturate-[250%]',
      'border-t border-glass-border-light dark:border-glass-border-dark',
      'shadow-glass-subtle dark:shadow-glass-subtle-dark'
    )}>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo Section - Left */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-glass-light dark:bg-glass-dark border border-glass-border-light dark:border-glass-border-dark">
              <Droplets className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">Liquid Glass</span>
          </div>

          {/* Copyright - Center */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © Copyright 2025. LiNKtrend Media
            </p>
          </div>

          {/* Legal Links - Right */}
          <div className="flex items-center gap-6">
            <Link 
              href="/terms" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms and Conditions
            </Link>
            <Link 
              href="/privacy" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/en/console/login" 
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Admin Console Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
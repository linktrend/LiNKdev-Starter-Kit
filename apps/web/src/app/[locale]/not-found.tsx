'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Mail, FileQuestion } from 'lucide-react';
import { useLocalePath } from '@/hooks/useLocalePath';

export default function NotFound() {
  const { buildPath } = useLocalePath();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl">
          <CardContent className="p-8 sm:p-12">
            <div className="text-center space-y-6">
              {/* 404 Display */}
              <div className="mb-8">
                <div className="text-8xl sm:text-9xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
                  404
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  Page Not Found
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto">
                  We couldn&apos;t find the page you&apos;re looking for. It might have been removed, 
                  had its name changed, or is temporarily unavailable.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href={buildPath('/')}>
                    <Home className="mr-2 h-5 w-5" />
                    Back to Home
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link href={buildPath('/contact')}>
                    <Mail className="mr-2 h-5 w-5" />
                    Contact Support
                  </Link>
                </Button>
              </div>

              {/* Popular Pages */}
              <div className="mt-12 pt-8 border-t border-border">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <FileQuestion className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-base font-semibold text-foreground">Popular Pages</h3>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link 
                    href={buildPath('/platform')} 
                    className="text-sm text-primary hover:underline underline-offset-4 transition-colors"
                  >
                    Platform
                  </Link>
                  <span className="text-muted-foreground">•</span>
                  <Link 
                    href={buildPath('/solutions')} 
                    className="text-sm text-primary hover:underline underline-offset-4 transition-colors"
                  >
                    Solutions
                  </Link>
                  <span className="text-muted-foreground">•</span>
                  <Link 
                    href={buildPath('/pricing')} 
                    className="text-sm text-primary hover:underline underline-offset-4 transition-colors"
                  >
                    Pricing
                  </Link>
                  <span className="text-muted-foreground">•</span>
                  <Link 
                    href={buildPath('/resources')} 
                    className="text-sm text-primary hover:underline underline-offset-4 transition-colors"
                  >
                    Resources
                  </Link>
                  <span className="text-muted-foreground">•</span>
                  <Link 
                    href={buildPath('/about')} 
                    className="text-sm text-primary hover:underline underline-offset-4 transition-colors"
                  >
                    About
                  </Link>
                  <span className="text-muted-foreground">•</span>
                  <Link 
                    href={buildPath('/contact')} 
                    className="text-sm text-primary hover:underline underline-offset-4 transition-colors"
                  >
                    Contact
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

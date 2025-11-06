'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollToTopButton } from '@/components/ui/ScrollToTopButton';
import React from 'react';

interface LegalPageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

/**
 * LegalPageLayout - Layout for Group 1 pages (Legal/Static Content)
 * Used by: Terms, Privacy, Manage Cookies, 404, Logout Confirmation, Form Confirmation
 * 
 * Features:
 * - Title and optional subtitle
 * - Back button (top right)
 * - Scrollable content area
 * - Floating scroll-to-top button
 */
export function LegalPageLayout({ title, subtitle, children }: LegalPageLayoutProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="container mx-auto px-8 py-12 max-w-4xl">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          {subtitle && (
            <p className="text-lg text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        {/* Back Button */}
        <Button
          onClick={handleBack}
          variant="outline"
          size="sm"
          className="ml-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Content Section with Scroll Button */}
      <div className="relative">
        <div className="prose prose-lg max-w-none pb-20">
          {children}
        </div>

        {/* Scroll to Top Button - positioned in bottom right, floats on scroll */}
        <div className="sticky bottom-8 float-right -mt-16 mr-0 z-40">
          <ScrollToTopButton />
        </div>
      </div>
    </div>
  );
}


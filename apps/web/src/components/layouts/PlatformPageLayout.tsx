import React from 'react';

interface PlatformPageLayoutProps {
  title: string;
  subtitle: string;
  featureSection1b?: React.ReactNode;
  mainContent: React.ReactNode;
  featureSection3a?: React.ReactNode;
  textSection3b?: React.ReactNode;
}

/**
 * PlatformPageLayout - Layout for Group 4 pages (Platform/Solution Pages)
 * Used by: All Platform pages (advantage-1, advantage-2, ai, innovation-support)
 *          All Solutions pages (customers, industry, company-size, role)
 * 
 * Structure:
 * - Section 1a: Title + subtitle (centered)
 * - Section 1b: Special feature placeholder
 * - Section 2: Main content area
 * - Section 3: 60/40 split (special feature / text)
 */
export function PlatformPageLayout({
  title,
  subtitle,
  featureSection1b,
  mainContent,
  featureSection3a,
  textSection3b
}: PlatformPageLayoutProps) {
  return (
    <div className="flex flex-col w-full">
      {/* Section 1: Header with title/subtitle and feature */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-8">
          {/* Section 1a: Title + Subtitle (centered) */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              {subtitle}
            </p>
          </div>

          {/* Section 1b: Special feature placeholder */}
          {featureSection1b && (
            <div className="mt-12">
              {featureSection1b}
            </div>
          )}
        </div>
      </section>

      {/* Section 2: Main Content */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-8">
          {mainContent}
        </div>
      </section>

      {/* Section 3: 60/40 Split (Feature / Text) */}
      {(featureSection3a || textSection3b) && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Section 3a: Special feature (60%) */}
              <div className="lg:col-span-3">
                {featureSection3a || (
                  <div className="bg-muted/50 rounded-lg p-8 h-full flex items-center justify-center">
                    <p className="text-muted-foreground text-center">
                      {/* Placeholder for special feature (carousel, scrolling text/images, etc.) */}
                      Special feature section
                    </p>
                  </div>
                )}
              </div>

              {/* Section 3b: Text content (40%) */}
              <div className="lg:col-span-2">
                {textSection3b || (
                  <div className="prose prose-lg">
                    <p className="text-muted-foreground">
                      Additional text content goes here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}


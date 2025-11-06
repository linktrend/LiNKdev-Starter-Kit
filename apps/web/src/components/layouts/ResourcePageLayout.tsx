import React from 'react';

interface ResourcePageLayoutProps {
  title: string;
  subtitle: string;
  mainContent: React.ReactNode;
  headerContent?: React.ReactNode;
  featureSection3a?: React.ReactNode;
  textSection3b?: React.ReactNode;
}

/**
 * ResourcePageLayout - Layout for Group 3 pages (Resource Pages)
 * Used by: Resources Library, Resources For Customers
 * 
 * Structure:
 * - Section 1: Title + subtitle (centered)
 * - Section 2: Main content area
 * - Section 3: 40/60 split (special feature / text)
 */
export function ResourcePageLayout({
  title,
  subtitle,
  mainContent,
  headerContent,
  featureSection3a,
  textSection3b
}: ResourcePageLayoutProps) {
  return (
    <div className="flex flex-col w-full">
      {/* Section 1: Title + Subtitle (centered) */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {subtitle}
          </p>
          {headerContent && (
            <div className="mt-10 text-left">
              {headerContent}
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

      {/* Section 3: 40/60 Split (Feature / Text) */}
      {(featureSection3a || textSection3b) && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Section 3a: Special feature (40%) */}
              <div className="lg:col-span-2">
                {featureSection3a || (
                  <div className="bg-muted/50 rounded-lg p-8 h-full flex items-center justify-center">
                    <p className="text-muted-foreground text-center">
                      {/* Placeholder for special feature (carousel, scrolling text/images, etc.) */}
                      Special feature section
                    </p>
                  </div>
                )}
              </div>

              {/* Section 3b: Text content (60%) */}
              <div className="lg:col-span-3">
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


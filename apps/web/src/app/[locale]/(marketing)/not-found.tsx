import { LegalPageLayout } from '@/components/layouts/LegalPageLayout';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <LegalPageLayout
      title="404 - Page Not Found"
      subtitle="The page you're looking for doesn't exist or has been moved."
    >
      <div className="text-center py-12">
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary mb-4">404</div>
          <p className="text-xl text-muted-foreground mb-8">
            We couldn't find the page you're looking for. It might have been removed, 
            had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg">
            <Link href="/en">
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/en/help-center">
              <Search className="mr-2 h-5 w-5" />
              Visit Help Center
            </Link>
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t">
          <h3 className="text-lg font-semibold mb-4">Popular Pages</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/en/platform" className="text-primary hover:underline">
              Platform
            </Link>
            <Link href="/en/solutions" className="text-primary hover:underline">
              Solutions
            </Link>
            <Link href="/en/pricing" className="text-primary hover:underline">
              Pricing
            </Link>
            <Link href="/en/resources" className="text-primary hover:underline">
              Resources
            </Link>
            <Link href="/en/about" className="text-primary hover:underline">
              About Us
            </Link>
            <Link href="/en/contact" className="text-primary hover:underline">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </LegalPageLayout>
  );
}


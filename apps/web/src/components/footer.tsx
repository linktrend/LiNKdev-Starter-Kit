import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="container mx-auto px-8 py-8">
        {/* Top Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">LTM Starter Kit</span>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div>
            <p>&copy; Copyright 2025. LiNKtrend Media</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/en/terms" className="hover:text-foreground transition-colors">
              Terms and Conditions
            </Link>
            <Link href="/en/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/en/console/login" className="hover:text-foreground transition-colors font-semibold">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

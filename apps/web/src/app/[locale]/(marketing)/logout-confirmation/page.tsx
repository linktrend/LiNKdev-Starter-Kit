'use client';

import { LegalPageLayout } from '@/components/layouts/LegalPageLayout';
import { Button } from '@/components/ui/button';
import { LogOut, X } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';

export default function LogoutConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || 'en';
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // TODO: Implement actual logout logic with Supabase
      // await supabase.auth.signOut();
      
      // Simulate logout delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to home page after logout
      router.push(`/${locale}`);
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <LegalPageLayout
      title="Log Out"
      subtitle="Are you sure you want to log out?"
    >
      <div className="text-center py-12 max-w-md mx-auto">
        <div className="mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogOut className="w-10 h-10 text-primary" />
          </div>
          
          <p className="text-lg text-muted-foreground mb-4">
            You are about to log out of your account. You will need to log in again to access your dashboard and account features.
          </p>
          
          <p className="text-sm text-muted-foreground">
            Your data and settings will be saved and available when you log back in.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            size="lg"
            variant="destructive"
            className="w-full sm:w-auto"
          >
            <LogOut className="mr-2 h-5 w-5" />
            {isLoggingOut ? 'Logging Out...' : 'Yes, Log Out'}
          </Button>
          
          <Button
            onClick={handleCancel}
            disabled={isLoggingOut}
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
          >
            <X className="mr-2 h-5 w-5" />
            Cancel
          </Button>
        </div>

        <div className="mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Need help? <a href={`/${locale}/help-center`} className="text-primary hover:underline">Visit our Help Center</a>
          </p>
        </div>
      </div>
    </LegalPageLayout>
  );
}


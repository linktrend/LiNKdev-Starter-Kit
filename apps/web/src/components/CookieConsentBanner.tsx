'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CookiePreferencesModal } from '@/components/modals/CookiePreferencesModal';
import Link from 'next/link';

// Helper function to set a cookie
const setCookie = (name: string, value: string, days: number) => {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + (value || '')  + expires + '; path=/';
};

// Helper function to get a cookie
const getCookie = (name: string): string | null => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const consent = getCookie('ltm_cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    setCookie('ltm_cookie_consent', 'all', 365);
    setShowBanner(false);
    // You might want to save detailed preferences here as well
    const allPreferences = { necessary: true, functional: true, analytics: true, marketing: true };
    localStorage.setItem('cookiePreferences', JSON.stringify(allPreferences));
  };

  const handleManageCookies = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // After managing, assume consent is given and hide banner
    if (!getCookie('ltm_cookie_consent')) {
        setCookie('ltm_cookie_consent', 'managed', 365);
    }
    setShowBanner(false);
  }

  if (!showBanner) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 w-full p-4 bg-background/95 border-t backdrop-blur-lg">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-foreground">
            <p>
              We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept All", 
              you consent to our use of cookies. Read our{' '}
              <Link href="/en/privacy" className="underline hover:text-primary">
                Privacy Policy
              </Link>.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button variant="outline" onClick={handleManageCookies}>
              Manage Cookies
            </Button>
            <Button onClick={handleAcceptAll}>
              Accept All
            </Button>
          </div>
        </div>
      </div>
      <CookiePreferencesModal isOpen={isModalOpen} onClose={handleModalClose} />
    </>
  );
}

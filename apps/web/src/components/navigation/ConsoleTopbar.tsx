'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Moon, Sun, Sparkles } from 'lucide-react';
import { NotificationsModal } from '@/components/ui/notifications-modal';

interface ConsoleTopbarProps {
  locale?: string;
  screenName?: string;
}

export function ConsoleTopbar({ locale = 'en', screenName = 'Overview' }: ConsoleTopbarProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const handleThemeToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <>
      <div className="border-b flex items-center px-6 sticky top-0 z-30 bg-background" style={{ height: '75px' }}>
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground font-medium">LTM Starter Kit: Console</div>
            <div className="text-sm font-semibold">{screenName}</div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNotificationsOpen(true)}
          >
            <Bell className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <NotificationsModal 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
}

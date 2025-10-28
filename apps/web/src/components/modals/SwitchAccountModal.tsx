'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Account {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface SwitchAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccountId?: string;
}

// Mock accounts - replace with actual user accounts
const mockAccounts: Account[] = [
  {
    id: '1',
    name: 'Preview User',
    email: 'preview@example.com',
    role: 'Primary Account'
  },
  {
    id: '2',
    name: 'Business Account',
    email: 'business@example.com',
    role: 'Business'
  },
  {
    id: '3',
    name: 'Personal Account',
    email: 'personal@example.com',
    role: 'Personal'
  }
];

export function SwitchAccountModal({ isOpen, onClose, currentAccountId = '1' }: SwitchAccountModalProps) {
  const [selectedAccountId, setSelectedAccountId] = useState(currentAccountId);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSwitch = () => {
    // TODO: Implement actual account switching logic
    console.log('Switching to account:', selectedAccountId);
    onClose();
  };

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 modal-backdrop"
      />
      
      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-lg border shadow-2xl overflow-hidden modal-bg"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">
            Switch Account
          </h2>
          <p className="text-sm text-muted-foreground/70 mb-6">
            Select an account to switch to
          </p>

          <div className="space-y-2 mb-6">
            {mockAccounts.map((account) => (
              <button
                key={account.id}
                onClick={() => setSelectedAccountId(account.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border transition-all",
                  selectedAccountId === account.id
                    ? "border-primary bg-primary/15"
                    : "border-border hover:border-gray-300 hover:bg-muted"
                )}
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={account.avatar} alt={account.name} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm text-muted-foreground truncate">
                    {account.name}
                  </div>
                  <div className="text-xs text-muted-foreground/60 truncate">
                    {account.email}
                  </div>
                  {account.role && (
                    <div className="text-xs text-primary truncate">
                      {account.role}
                    </div>
                  )}
                </div>
                {selectedAccountId === account.id && (
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSwitch}
              className="flex-1"
              disabled={selectedAccountId === currentAccountId}
            >
              Switch Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}


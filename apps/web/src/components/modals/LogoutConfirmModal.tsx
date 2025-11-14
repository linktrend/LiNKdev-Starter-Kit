'use client';

import { useEffect, useState } from 'react';
import { createPortal, useFormStatus } from 'react-dom';

import { logout } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale?: string;
}

function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="flex-1"
      disabled={pending}
    >
      {pending ? 'Logging out...' : 'Logout'}
    </Button>
  );
}

export function LogoutConfirmModal({ isOpen, onClose, locale = 'en' }: LogoutConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

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
          <div className="flex items-center gap-3 mb-4">
            <div className="p-1 rounded-full bg-warning/80 border-2 border-warning shadow-lg shadow-warning/50">
              <AlertTriangle className="h-6 w-6 text-warning-foreground" />
            </div>
            <h2 className="text-xl font-bold">
              Confirm Logout
            </h2>
          </div>

          <p className="text-sm text-muted-foreground/70 mb-6">
            Are you sure you want to log out? You will need to sign in again to access your account.
          </p>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              type="button"
            >
              Cancel
            </Button>
            <form action={logout} className="flex-1">
              <input type="hidden" name="locale" value={locale} />
              <LogoutButton />
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

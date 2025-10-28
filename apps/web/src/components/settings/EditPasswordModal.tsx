'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditPasswordModal({ isOpen, onClose }: EditPasswordModalProps) {
  const [mounted, setMounted] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSave = () => {
    console.log('Updating password...');
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
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <h2 className="text-xl font-bold">Change Password</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4 mb-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Current Password <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2.5 pr-10 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                New Password <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 pr-10 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Confirm New Password <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 pr-10 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Password Requirements:</p>
            <ul className="text-sm text-blue-900 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>At least 12 characters</li>
              <li>Mix of uppercase and lowercase letters</li>
              <li>At least one number</li>
              <li>At least one special character</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-muted">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
          >
            Update Password
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

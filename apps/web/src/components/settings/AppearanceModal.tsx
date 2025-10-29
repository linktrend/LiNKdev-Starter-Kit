'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Palette, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppearanceModal({ isOpen, onClose }: AppearanceModalProps) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [compactMode, setCompactMode] = useState(false);
  const [accentColor, setAccentColor] = useState('bg-primary');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSave = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Saving appearance settings...', { theme, compactMode, accentColor });
    alert('Appearance settings saved successfully!');
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
            <Palette className="h-5 w-5" />
            <h2 className="text-xl font-bold">Customize Appearance</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Theme */}
          <div>
            <p className="font-medium mb-3">Theme</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                  theme === 'light'
                    ? 'border-primary bg-muted'
                    : 'border-border hover:border-input'
                }`}
              >
                <Sun className="h-6 w-6" />
                <span className="text-sm font-medium">Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                  theme === 'dark'
                    ? 'border-primary bg-muted'
                    : 'border-border hover:border-input'
                }`}
              >
                <Moon className="h-6 w-6" />
                <span className="text-sm font-medium">Dark</span>
              </button>
              <button
                onClick={() => setTheme('auto')}
                className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                  theme === 'auto'
                    ? 'border-primary bg-muted'
                    : 'border-border hover:border-input'
                }`}
              >
                <Monitor className="h-6 w-6" />
                <span className="text-sm font-medium">Auto</span>
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Font Size</label>
            <select className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
              <option>Small</option>
              <option selected>Medium</option>
              <option>Large</option>
            </select>
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Font Family</label>
            <select className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
              <option selected>Inter</option>
              <option>System UI</option>
              <option>Roboto</option>
              <option>Open Sans</option>
            </select>
          </div>

          {/* Accent Color */}
          <div>
            <p className="font-medium mb-3">Accent Color</p>
            <div className="flex gap-2">
              {['bg-primary', 'bg-purple-500', 'bg-success', 'bg-orange-500', 'bg-pink-500'].map((color, i) => (
                <button
                  key={i}
                  onClick={() => setAccentColor(color)}
                  className={`w-12 h-12 rounded-lg ${color} ${
                    accentColor === color ? 'ring-2 ring-offset-2 ring-gray-900' : ''
                  } hover:opacity-80 transition-opacity`}
                />
              ))}
            </div>
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
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}


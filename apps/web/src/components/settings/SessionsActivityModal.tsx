'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Monitor, Smartphone, Laptop, Trash2, MapPin, Clock } from 'lucide-react';

interface SessionsActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SessionsActivityModal({ isOpen, onClose }: SessionsActivityModalProps) {
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
        className="relative w-full max-w-3xl rounded-lg border shadow-2xl overflow-hidden modal-bg"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            <h2 className="text-xl font-bold">Sessions & Activity</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Active Sessions */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4">Active Sessions</h3>
            <div className="space-y-3">
              {/* Current Session */}
              <div className="p-4 bg-muted rounded-lg border-2 border-green-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Laptop className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">Chrome on MacBook Pro</p>
                        <span className="px-2 py-0.5 bg-success/20 text-success text-xs font-medium rounded-full">
                          Current
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>San Francisco, CA</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Last active 2 minutes ago</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">IP: 192.168.1.1</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Session 1 */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Smartphone className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Safari on iPhone 14</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>San Francisco, CA</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Last active 1 hour ago</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">IP: 192.168.1.2</p>
                    </div>
                  </div>
                  <button className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Other Session 2 */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Monitor className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Firefox on Windows PC</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>New York, NY</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Last active 2 days ago</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">IP: 203.0.113.0</p>
                    </div>
                  </div>
                  <button className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div>
            <h3 className="font-semibold mb-4">Activity Logs</h3>
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-1">Password changed</p>
                <p className="text-sm text-muted-foreground">2 hours ago • IP: 192.168.1.1</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

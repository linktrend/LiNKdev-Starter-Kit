'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Activity, Calendar } from 'lucide-react';

interface UsageDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UsageDashboardModal({ isOpen, onClose }: UsageDashboardModalProps) {
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
        className="relative w-full max-w-2xl rounded-lg border shadow-2xl overflow-hidden modal-bg"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <h2 className="text-xl font-bold">Usage Dashboard</h2>
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
          {/* Current Period */}
          <div className="flex items-center gap-2 mb-6 text-sm">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Current Period: October 2025</span>
          </div>

          {/* Usage Metrics */}
          <div className="space-y-6 mb-8">
            {/* Credits */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Credits</span>
                <span className="text-sm font-semibold">7,500 / 10,000</span>
              </div>
              <div className="w-full h-3 bg-accent rounded-full overflow-hidden">
                <div className="h-full bg-warning" style={{ width: '75%' }}></div>
              </div>
            </div>

            {/* Tokens */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Tokens</span>
                <span className="text-sm font-semibold">450,000 / 500,000</span>
              </div>
              <div className="w-full h-3 bg-accent rounded-full overflow-hidden">
                <div className="h-full bg-danger" style={{ width: '90%' }}></div>
              </div>
            </div>

            {/* API Calls */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">API Calls</span>
                <span className="text-sm font-semibold">12,450 / 15,000</span>
              </div>
              <div className="w-full h-3 bg-accent rounded-full overflow-hidden">
                <div className="h-full bg-warning" style={{ width: '83%' }}></div>
              </div>
            </div>

            {/* Storage */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Storage</span>
                <span className="text-sm font-semibold">6.2 GB / 10 GB</span>
              </div>
              <div className="w-full h-3 bg-accent rounded-full overflow-hidden">
                <div className="h-full bg-success" style={{ width: '62%' }}></div>
              </div>
            </div>
          </div>

          {/* Historical Usage */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4" />
              <h3 className="font-semibold">Historical Usage</h3>
            </div>

            <div className="space-y-4">
              {/* November */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">November</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Credits:</span>
                    <span className="text-base font-bold ml-2">8,200</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Tokens:</span>
                    <span className="text-base font-bold ml-2">480,000</span>
                  </div>
                </div>
              </div>

              {/* October */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">October</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Credits:</span>
                    <span className="text-base font-bold ml-2">7,900</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Tokens:</span>
                    <span className="text-base font-bold ml-2">465,000</span>
                  </div>
                </div>
              </div>

              {/* September */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">September</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Credits:</span>
                    <span className="text-base font-bold ml-2">7,100</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Tokens:</span>
                    <span className="text-base font-bold ml-2">420,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}


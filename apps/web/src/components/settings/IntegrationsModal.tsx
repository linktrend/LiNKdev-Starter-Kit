'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Link2, XCircle, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IntegrationsModal({ isOpen, onClose }: IntegrationsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [integrations, setIntegrations] = useState([
    { id: 1, name: 'n8n', description: 'Workflow automation platform', connected: true },
    { id: 2, name: 'Google Drive', description: 'Cloud storage and file sharing', connected: true },
    { id: 3, name: 'AWS', description: 'Cloud computing services', connected: false },
    { id: 4, name: 'Asana', description: 'Project management tool', connected: true },
    { id: 5, name: 'Gmail', description: 'Email service', connected: false },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleToggleIntegration = (id: number) => {
    setIntegrations(integrations.map(int => 
      int.id === id ? { ...int, connected: !int.connected } : int
    ));
    alert(`Integration ${integrations.find(int => int.id === id)?.name} status updated!`);
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
        className="relative w-full max-w-2xl rounded-lg border shadow-2xl overflow-hidden modal-bg"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            <h2 className="text-xl font-bold">Manage Integrations</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="flex items-center justify-between p-4 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="font-medium">{integration.name}</p>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {integration.connected && (
                  <span className="px-2 py-0.5 bg-success/20 text-success text-xs font-medium rounded-full">
                    Connected
                  </span>
                )}
                {integration.connected ? (
                  <button 
                    onClick={() => handleToggleIntegration(integration.id)}
                    className="px-4 py-2 text-danger border border-danger/20 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-danger/10 transition-colors min-w-[130px] justify-center"
                  >
                    <XCircle className="h-4 w-4" />
                    Disconnect
                  </button>
                ) : (
                  <Button 
                    onClick={() => handleToggleIntegration(integration.id)}
                    className="flex items-center gap-2 min-w-[130px] justify-center"
                  >
                    <Check className="h-4 w-4" />
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-muted">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}


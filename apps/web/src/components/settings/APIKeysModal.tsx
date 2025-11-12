'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Key, Eye, EyeOff, Copy, Trash2, Zap, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface APIKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function APIKeysModal({ isOpen, onClose }: APIKeysModalProps) {
  const [mounted, setMounted] = useState(false);
  const [showKeys, setShowKeys] = useState<{[key: number]: boolean}>({});
  const [activeTab, setActiveTab] = useState<'app' | 'provider'>('app');
  const [showGeneratedKeyModal, setShowGeneratedKeyModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const apiKeys = [
    { id: 1, name: 'Production Key', type: 'OpenAI', created: '2024-12-01', lastUsed: '2 hours ago' },
    { id: 2, name: 'Anthropic Dev', type: 'Anthropic', created: '2024-11-15', lastUsed: 'Never' },
  ];

  const appKey = { name: 'Production Key', created: '2024-12-01', lastUsed: '2 hours ago' };

  const toggleKeyVisibility = (id: number) => {
    setShowKeys({ ...showKeys, [id]: !showKeys[id] });
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    alert('API key copied to clipboard!');
  };

  const handleCreateKey = async () => {
    // Generate a mock API key
    const mockKey = 'sk-' + Array.from({ length: 48 }, () => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]
    ).join('');
    
    setGeneratedKey(mockKey);
    setShowGeneratedKeyModal(true);
  };

  const handleCloseGeneratedKeyModal = () => {
    setShowGeneratedKeyModal(false);
    // Add the generated key to the list (in a real app, this would be an API call)
    alert('API key added to your list!');
  };

  const handleDeleteKey = (id: number) => {
    if (confirm('Are you sure you want to delete this API key?')) {
      alert('API key deleted successfully!');
    }
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
        className="relative w-full max-w-3xl h-[600px] rounded-lg border shadow-2xl overflow-hidden modal-bg flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <h2 className="text-xl font-bold">API Keys</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Tabs */}
          <div className="p-6 pb-0">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setActiveTab('app')}
              className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                activeTab === 'app'
                  ? 'border-primary bg-muted'
                  : 'border-border hover:border-input'
              }`}
            >
              <Zap className="h-8 w-8" />
              <span className="text-sm font-medium">Generate App API Key</span>
            </button>
            <button
              onClick={() => setActiveTab('provider')}
              className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                activeTab === 'provider'
                  ? 'border-primary bg-muted'
                  : 'border-border hover:border-input'
              }`}
            >
              <Key className="h-8 w-8" />
              <span className="text-sm font-medium">Add Provider API Key</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {activeTab === 'app' ? (
            <>

              {/* App API Key Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">1 app API key generated</p>
                  <Button onClick={handleCreateKey} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Generate Key
                  </Button>
                </div>

                {/* App Key */}
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium mb-2">{appKey.name}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      readOnly
                      value="••••••••••••••••"
                      className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-sm"
                    />
                    <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleCopy('sk-production-key-example')} className="p-2 hover:bg-accent rounded-lg transition-colors">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteKey(1)} className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Created: {appKey.created}</span>
                    <span>Last used: {appKey.lastUsed}</span>
                  </div>
                </div>
              </div>

            </>
          ) : (
            <>
              {/* Add Provider Key Form */}
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Provider</label>
                  <select className="w-full px-4 py-2.5 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
                    <option>OpenAI</option>
                    <option>Anthropic</option>
                    <option>Google AI</option>
                    <option>Cohere</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Key Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Production Key"
                    className="w-full px-4 py-2.5 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">API Key</label>
                  <input
                    type="password"
                    placeholder="Enter your API key"
                    className="w-full px-4 py-2.5 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
                
                <Button onClick={handleCreateKey} className="w-full">
                  Add Key
                </Button>
              </div>

              {/* Provider Keys List */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">2 provider keys added</p>
                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{key.name}</p>
                        <span className="text-xs text-muted-foreground">{key.type}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          readOnly
                          value="••••••••••••••••"
                          className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-sm"
                        />
                        <button
                          onClick={() => toggleKeyVisibility(key.id)}
                          className="p-2 hover:bg-accent rounded-lg transition-colors"
                        >
                          {showKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button onClick={() => handleDeleteKey(key.id)} className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Created: {key.created}</span>
                        <span>Last used: {key.lastUsed}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-muted flex-shrink-0">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Generated Key Modal */}
      {showGeneratedKeyModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 100000 }}
        >
          {/* Backdrop */}
          <div 
            className="fixed inset-0 modal-backdrop"
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-md rounded-lg border shadow-2xl overflow-hidden modal-bg">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                <h2 className="text-xl font-bold">API Key Generated</h2>
              </div>
              <button
                onClick={handleCloseGeneratedKeyModal}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-2">Important!</p>
                <p className="text-xs text-yellow-900 dark:text-yellow-300">Save this API key securely. You won&apos;t be able to see it again.</p>
              </div>
              
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Your API Key</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedKey}
                    className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-sm font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedKey);
                      alert('API key copied to clipboard!');
                    }}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                    title="Copy API key"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t bg-muted">
              <Button onClick={handleCloseGeneratedKeyModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}


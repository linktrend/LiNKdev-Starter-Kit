'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportExportModal({ isOpen, onClose }: ImportExportModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportData, setExportData] = useState({
    profile: true,
    projects: true,
    settings: true,
    activity: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleExport = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Exporting data...', exportData);
    alert('Data exported successfully!');
    onClose();
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert('Please select a file to import');
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Importing data from file:', selectedFile.name);
    alert('Data imported successfully!');
    onClose();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
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
            <FileText className="h-5 w-5" />
            <h2 className="text-xl font-bold">Import/Export Data</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="p-6 pb-0">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setActiveTab('export')}
              className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                activeTab === 'export'
                  ? 'border-primary bg-muted'
                  : 'border-border hover:border-input'
              }`}
            >
              <Download className="h-8 w-8" />
              <span className="text-sm font-medium">Export</span>
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                activeTab === 'import'
                  ? 'border-primary bg-muted'
                  : 'border-border hover:border-input'
              }`}
            >
              <Upload className="h-8 w-8" />
              <span className="text-sm font-medium">Import</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Export Format */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Export Format</label>
                <select className="w-full px-4 py-2.5 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
                  <option>JSON</option>
                  <option>CSV</option>
                  <option>XML</option>
                </select>
              </div>

              {/* Select Data to Export */}
              <div>
                <p className="font-medium mb-3">Select Data to Export</p>
                <div className="space-y-2">
                  {Object.entries(exportData).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-3 p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => setExportData({ ...exportData, [key]: !value })}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          value 
                            ? 'bg-primary border-primary' 
                            : 'bg-white border-gray-300'
                        }`}>
                          {value && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">Select a file to import your data</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button onClick={handleChooseFile}>
                  Choose File
                </Button>
                {selectedFile && (
                  <p className="text-sm text-primary mt-2">Selected: {selectedFile.name}</p>
                )}
              </div>

              {/* Warning */}
              <div className="bg-warning/20 border border-warning/30 rounded-lg p-4">
                <p className="text-sm text-warning">
                  <span className="font-semibold">Warning:</span> Importing data will overwrite existing data. Make sure to export your current data first.
                </p>
              </div>
            </div>
          )}
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
            onClick={activeTab === 'export' ? handleExport : handleImport}
            className="flex-1"
          >
            {activeTab === 'export' ? 'Export Data' : 'Import Data'}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}


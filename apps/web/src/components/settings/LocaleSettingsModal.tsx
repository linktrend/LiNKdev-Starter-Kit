'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocaleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LocaleSettingsModal({ isOpen, onClose }: LocaleSettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState('English');
  const [region, setRegion] = useState('United States');
  const [calendar, setCalendar] = useState('Gregorian');
  const [measurement, setMeasurement] = useState('Metric');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [currency, setCurrency] = useState('USD ($)');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Saving locale settings...', { language, region, calendar, measurement, dateFormat, currency });
    alert('Locale settings saved successfully!');
    setSaving(false);
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
            <Globe className="h-5 w-5" />
            <h2 className="text-xl font-bold">Locale Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Language */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-4 py-2.5 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Region</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full px-4 py-2.5 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Canada</option>
              <option>Australia</option>
            </select>
          </div>

          {/* Calendar */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Calendar</label>
            <select value={calendar} onChange={(e) => setCalendar(e.target.value)} className="w-full px-4 py-2.5 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
              <option>Gregorian</option>
              <option>Julian</option>
              <option>Islamic</option>
              <option>Hebrew</option>
            </select>
          </div>

          {/* Measurement System */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Measurement System</label>
            <select value={measurement} onChange={(e) => setMeasurement(e.target.value)} className="w-full px-4 py-2.5 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
              <option>Metric</option>
              <option>Imperial</option>
            </select>
          </div>

          {/* Date Format */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Date Format</label>
            <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="w-full px-4 py-2.5 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-4 py-2.5 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
              <option>JPY (¥)</option>
            </select>
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
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

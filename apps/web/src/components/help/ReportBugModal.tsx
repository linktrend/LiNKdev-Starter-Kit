'use client';

import { useState } from 'react';
import { X, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportBugModal({ isOpen, onClose }: ReportBugModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    severity: 'medium',
    browser: 'chrome',
    description: '',
    stepsToReproduce: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Bug report submitted:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border shadow-2xl modal-bg"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-danger" />
            <h2 className="text-base text-muted-foreground">Report a Bug</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-all"
          >
            <X className="h-5 w-5 text-muted-foreground/70" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Bug Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2.5 pr-20 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
              placeholder="Brief description of the bug"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Severity <span className="text-danger">*</span>
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
              >
                <option value="low">Low - Minor issue</option>
                <option value="medium">Medium - Affects functionality</option>
                <option value="high">High - Major issue</option>
                <option value="critical">Critical - App unusable</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Browser <span className="text-danger">*</span>
              </label>
              <select
                value={formData.browser}
                onChange={(e) => setFormData({ ...formData, browser: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
              >
                <option value="chrome">Chrome</option>
                <option value="firefox">Firefox</option>
                <option value="safari">Safari</option>
                <option value="edge">Edge</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Bug Description <span className="text-danger">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm resize-none"
              placeholder="What happened? What did you expect to happen?"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Steps to Reproduce <span className="text-danger">*</span>
            </label>
            <textarea
              value={formData.stepsToReproduce}
              onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}
              required
              rows={5}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm resize-none"
              placeholder="1. Go to...\n2. Click on...\n3. See error..."
            />
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t border-border">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex items-center gap-2"
            >
              <Bug className="h-4 w-4" />
              Submit Bug Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

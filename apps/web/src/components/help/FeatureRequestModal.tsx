'use client';

import { useState } from 'react';
import { X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeatureRequestModal({ isOpen, onClose }: FeatureRequestModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'ui-ux',
    description: '',
    useCase: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Feature request submitted:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border shadow-2xl modal-bg"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            <h2 className="text-base text-muted-foreground">Feature Request</h2>
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
              Feature Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2.5 pr-20 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
              placeholder="Brief title for your feature request"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Category <span className="text-danger">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
            >
              <option value="ui-ux">UI/UX Improvement</option>
              <option value="functionality">New Functionality</option>
              <option value="integration">Integration</option>
              <option value="performance">Performance</option>
              <option value="mobile">Mobile App</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Feature Description <span className="text-danger">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={5}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm resize-none"
              placeholder="Describe the feature you'd like to see..."
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Use Case <span className="text-danger">*</span>
            </label>
            <textarea
              value={formData.useCase}
              onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm resize-none"
              placeholder="How would this feature help you? What problem does it solve?"
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
              <Lightbulb className="h-4 w-4" />
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

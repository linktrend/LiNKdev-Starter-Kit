'use client';

import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubmitTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmitTicketModal({ isOpen, onClose }: SubmitTicketModalProps) {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'technical',
    priority: 'medium',
    description: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle submit logic here
    console.log('Ticket submitted:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border shadow-2xl modal-bg"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-base text-muted-foreground">Submit Support Ticket</h2>
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
              Subject <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              className="w-full px-4 py-2.5 pr-20 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
              placeholder="Brief description of your issue"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing & Payments</option>
                <option value="account">Account & Settings</option>
                <option value="feature">Feature Request</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Priority <span className="text-danger">*</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Description <span className="text-danger">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={6}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm resize-none"
              placeholder="Please provide detailed information about your issue..."
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
              <Send className="h-4 w-4" />
              Submit Ticket
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserSurveyModal({ isOpen, onClose }: UserSurveyModalProps) {
  const [formData, setFormData] = useState({
    satisfaction: 0,
    easeOfUse: 0,
    features: 0,
    recommendation: 0,
    feedback: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Survey submitted:', formData);
    onClose();
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (value: number) => void; 
    label: string;
  }) => (
    <div className="space-y-1">
      <label className="block text-sm text-muted-foreground">
        {label} <span className="text-danger">*</span>
      </label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-all"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value
                  ? 'fill-warning text-warning'
                  : 'text-muted-foreground hover:text-warning'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-xs text-muted-foreground/70 self-center">
          {value > 0 ? `${value}/5` : 'Not rated'}
        </span>
      </div>
    </div>
  );

  const isFormValid = formData.satisfaction > 0 && formData.easeOfUse > 0 && formData.features > 0 && formData.recommendation > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border shadow-2xl modal-bg"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-warning" />
            <h2 className="text-base text-muted-foreground">User Survey</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-all"
          >
            <X className="h-5 w-5 text-muted-foreground/70" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground/70">
            Help us improve by sharing your experience. All ratings are required.
          </p>

          <StarRating
            label="Overall Satisfaction"
            value={formData.satisfaction}
            onChange={(value) => setFormData({ ...formData, satisfaction: value })}
          />

          <StarRating
            label="Ease of Use"
            value={formData.easeOfUse}
            onChange={(value) => setFormData({ ...formData, easeOfUse: value })}
          />

          <StarRating
            label="Features & Functionality"
            value={formData.features}
            onChange={(value) => setFormData({ ...formData, features: value })}
          />

          <StarRating
            label="Likelihood to Recommend"
            value={formData.recommendation}
            onChange={(value) => setFormData({ ...formData, recommendation: value })}
          />

          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Additional Feedback (Optional)
            </label>
            <textarea
              value={formData.feedback}
              onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm resize-none"
              placeholder="Any other comments or suggestions?"
            />
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-border">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid}
              className="flex items-center gap-2"
              size="sm"
            >
              <Star className="h-4 w-4" />
              Submit Survey
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

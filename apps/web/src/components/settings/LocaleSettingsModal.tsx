'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { LOCALE_OPTIONS } from '@/lib/mocks/onboarding';

const localeSchema = z.object({
  locale: z.string().min(2, 'Please select a locale'),
  timezone: z.string().optional(),
  region: z.string().optional(),
});

type LocaleFormData = z.infer<typeof localeSchema>;

interface LocaleSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLocale?: string;
}

export function LocaleSettingsModal({ open, onOpenChange, currentLocale = 'en' }: LocaleSettingsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<LocaleFormData>({
    resolver: zodResolver(localeSchema),
    defaultValues: {
      locale: currentLocale,
      timezone: 'UTC-8',
      region: 'US',
    },
  });

  const onSubmit = async (data: LocaleFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual locale update logic
      console.log('Locale settings update:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Locale settings updated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Locale update error:', error);
      toast.error('Failed to update locale settings. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  const watchedLocale = watch('locale');
  const selectedLocale = LOCALE_OPTIONS.find(option => option.value === watchedLocale);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-glass-light dark:bg-glass-dark backdrop-blur-glass border-glass-border-light dark:border-glass-border-dark shadow-glass-subtle dark:shadow-glass-subtle-dark max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Locale & Region Settings
          </DialogTitle>
          <DialogDescription>
            Configure your language, timezone, and regional preferences
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Language & Region</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="locale">Language</Label>
                <Select
                  value={watchedLocale}
                  onValueChange={(value) => setValue('locale', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCALE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <span>{option.flag}</span>
                          <span>{option.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.locale && (
                  <p className="text-sm text-destructive">{errors.locale.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={watch('timezone')}
                  onValueChange={(value) => setValue('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC-12">UTC-12 (Baker Island)</SelectItem>
                    <SelectItem value="UTC-11">UTC-11 (American Samoa)</SelectItem>
                    <SelectItem value="UTC-10">UTC-10 (Hawaii)</SelectItem>
                    <SelectItem value="UTC-9">UTC-9 (Alaska)</SelectItem>
                    <SelectItem value="UTC-8">UTC-8 (Pacific Time)</SelectItem>
                    <SelectItem value="UTC-7">UTC-7 (Mountain Time)</SelectItem>
                    <SelectItem value="UTC-6">UTC-6 (Central Time)</SelectItem>
                    <SelectItem value="UTC-5">UTC-5 (Eastern Time)</SelectItem>
                    <SelectItem value="UTC-4">UTC-4 (Atlantic Time)</SelectItem>
                    <SelectItem value="UTC-3">UTC-3 (Brazil)</SelectItem>
                    <SelectItem value="UTC-2">UTC-2 (Mid-Atlantic)</SelectItem>
                    <SelectItem value="UTC-1">UTC-1 (Azores)</SelectItem>
                    <SelectItem value="UTC+0">UTC+0 (Greenwich)</SelectItem>
                    <SelectItem value="UTC+1">UTC+1 (Central Europe)</SelectItem>
                    <SelectItem value="UTC+2">UTC+2 (Eastern Europe)</SelectItem>
                    <SelectItem value="UTC+3">UTC+3 (Moscow)</SelectItem>
                    <SelectItem value="UTC+4">UTC+4 (Gulf)</SelectItem>
                    <SelectItem value="UTC+5">UTC+5 (Pakistan)</SelectItem>
                    <SelectItem value="UTC+6">UTC+6 (Bangladesh)</SelectItem>
                    <SelectItem value="UTC+7">UTC+7 (Thailand)</SelectItem>
                    <SelectItem value="UTC+8">UTC+8 (China)</SelectItem>
                    <SelectItem value="UTC+9">UTC+9 (Japan)</SelectItem>
                    <SelectItem value="UTC+10">UTC+10 (Australia)</SelectItem>
                    <SelectItem value="UTC+11">UTC+11 (Solomon Islands)</SelectItem>
                    <SelectItem value="UTC+12">UTC+12 (New Zealand)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select
                  value={watch('region')}
                  onValueChange={(value) => setValue('region', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="ES">Spain</SelectItem>
                    <SelectItem value="IT">Italy</SelectItem>
                    <SelectItem value="JP">Japan</SelectItem>
                    <SelectItem value="KR">South Korea</SelectItem>
                    <SelectItem value="CN">China</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                    <SelectItem value="BR">Brazil</SelectItem>
                    <SelectItem value="MX">Mexico</SelectItem>
                    <SelectItem value="IN">India</SelectItem>
                    <SelectItem value="RU">Russia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>Language: {selectedLocale?.label || 'English'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Timezone: {watch('timezone') || 'UTC-8'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Region: {watch('region') || 'US'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

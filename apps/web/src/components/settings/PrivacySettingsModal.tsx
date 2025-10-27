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
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, Shield, BarChart3, Users, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const privacySchema = z.object({
  profileVisibility: z.enum(['public', 'private', 'team']),
  activityTracking: z.boolean(),
  dataSharing: z.boolean(),
  analytics: z.boolean(),
  marketingData: z.boolean(),
  locationTracking: z.boolean(),
  searchHistory: z.boolean(),
});

type PrivacyFormData = z.infer<typeof privacySchema>;

interface PrivacySettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacySettingsModal({ open, onOpenChange }: PrivacySettingsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PrivacyFormData>({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      profileVisibility: 'private',
      activityTracking: true,
      dataSharing: false,
      analytics: true,
      marketingData: false,
      locationTracking: false,
      searchHistory: true,
    },
  });

  const onSubmit = async (data: PrivacyFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual privacy settings update logic
      console.log('Privacy settings update:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Privacy settings updated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Privacy update error:', error);
      toast.error('Failed to update privacy settings. Please try again.');
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

  const watchedValues = watch();

  const visibilityOptions = [
    {
      value: 'public',
      label: 'Public',
      description: 'Your profile is visible to everyone',
    },
    {
      value: 'private',
      label: 'Private',
      description: 'Your profile is only visible to you',
    },
    {
      value: 'team',
      label: 'Team Only',
      description: 'Your profile is visible to team members',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-glass-light dark:bg-glass-dark backdrop-blur-glass border-glass-border-light dark:border-glass-border-dark shadow-glass-subtle dark:shadow-glass-subtle-dark max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </DialogTitle>
          <DialogDescription>
            Control your privacy and data sharing preferences
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5" />
                Profile Visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profileVisibility">Who can see your profile?</Label>
                <Select
                  value={watchedValues.profileVisibility}
                  onValueChange={(value) => setValue('profileVisibility', value as 'public' | 'private' | 'team')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    {visibilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.profileVisibility && (
                  <p className="text-sm text-destructive">{errors.profileVisibility.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5" />
                Data Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Activity Tracking</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow us to track your activity to improve the service
                    </p>
                  </div>
                  <Switch
                    checked={watchedValues.activityTracking}
                    onCheckedChange={(checked) => setValue('activityTracking', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Analytics</Label>
                    <p className="text-xs text-muted-foreground">
                      Help us understand how you use the platform
                    </p>
                  </div>
                  <Switch
                    checked={watchedValues.analytics}
                    onCheckedChange={(checked) => setValue('analytics', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Search History</Label>
                    <p className="text-xs text-muted-foreground">
                      Save your search history for better recommendations
                    </p>
                  </div>
                  <Switch
                    checked={watchedValues.searchHistory}
                    onCheckedChange={(checked) => setValue('searchHistory', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Location Tracking</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow location-based features and recommendations
                    </p>
                  </div>
                  <Switch
                    checked={watchedValues.locationTracking}
                    onCheckedChange={(checked) => setValue('locationTracking', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Data Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Share Data with Partners</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow sharing of anonymized data with trusted partners
                    </p>
                  </div>
                  <Switch
                    checked={watchedValues.dataSharing}
                    onCheckedChange={(checked) => setValue('dataSharing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Marketing Data</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow use of your data for marketing purposes
                    </p>
                  </div>
                  <Switch
                    checked={watchedValues.marketingData}
                    onCheckedChange={(checked) => setValue('marketingData', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Download className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Export Your Data</Label>
                    <p className="text-xs text-muted-foreground">
                      Download a copy of all your data
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-destructive">Delete Account</Label>
                    <p className="text-xs text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
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

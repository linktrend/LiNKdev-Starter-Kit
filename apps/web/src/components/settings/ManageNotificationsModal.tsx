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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, Smartphone, Shield, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

const notificationsSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  sms: z.boolean(),
  marketing: z.boolean(),
  security: z.boolean(),
  updates: z.boolean(),
  browser: z.boolean(),
  mobile: z.boolean(),
});

type NotificationsFormData = z.infer<typeof notificationsSchema>;

interface ManageNotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageNotificationsModal({ open, onOpenChange }: ManageNotificationsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<NotificationsFormData>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
      security: true,
      updates: true,
      browser: true,
      mobile: false,
    },
  });

  const onSubmit = async (data: NotificationsFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual notification preferences update logic
      console.log('Notification preferences update:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Notification preferences updated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Notification update error:', error);
      toast.error('Failed to update notification preferences. Please try again.');
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

  const notificationCategories = [
    {
      id: 'email',
      title: 'Email Notifications',
      description: 'Receive updates via email',
      icon: Mail,
      options: [
        { id: 'security', label: 'Security Alerts', description: 'Important security updates' },
        { id: 'updates', label: 'Product Updates', description: 'New features and improvements' },
        { id: 'marketing', label: 'Marketing Emails', description: 'Promotional content and offers' },
      ],
    },
    {
      id: 'push',
      title: 'Push Notifications',
      description: 'Receive browser and mobile notifications',
      icon: Smartphone,
      options: [
        { id: 'browser', label: 'Browser Notifications', description: 'Desktop browser notifications' },
        { id: 'mobile', label: 'Mobile Push', description: 'Mobile app notifications' },
      ],
    },
    {
      id: 'sms',
      title: 'SMS Notifications',
      description: 'Receive text messages for critical updates',
      icon: Bell,
      options: [
        { id: 'sms', label: 'SMS Alerts', description: 'Critical security and account alerts' },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </DialogTitle>
          <DialogDescription>
            Choose how you want to receive notifications and updates
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {notificationCategories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <category.icon className="h-5 w-5" />
                  {category.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Main toggle for category */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={category.id} className="text-base font-medium">
                      Enable {category.title}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Turn on/off all {category.title.toLowerCase()}
                    </p>
                  </div>
                  <Switch
                    id={category.id}
                    checked={watchedValues[category.id as keyof NotificationsFormData] as boolean}
                    onCheckedChange={(checked) => setValue(category.id as keyof NotificationsFormData, checked)}
                  />
                </div>

                <Separator />

                {/* Individual options */}
                <div className="space-y-3">
                  {category.options.map((option) => (
                    <div key={option.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor={option.id} className="text-sm font-medium">
                          {option.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                      <Switch
                        id={option.id}
                        checked={watchedValues[option.id as keyof NotificationsFormData] as boolean}
                        onCheckedChange={(checked) => setValue(option.id as keyof NotificationsFormData, checked)}
                        disabled={!watchedValues[category.id as keyof NotificationsFormData]}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Notification Frequency */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Megaphone className="h-5 w-5" />
                Notification Frequency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Quiet Hours</Label>
                    <p className="text-xs text-muted-foreground">
                      Pause notifications during specific hours
                    </p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Digest Mode</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive daily summaries instead of individual notifications
                    </p>
                  </div>
                  <Switch defaultChecked={false} />
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
              {isSubmitting ? 'Saving...' : 'Save Preferences'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

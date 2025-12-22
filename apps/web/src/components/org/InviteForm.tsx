'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { OrgRole } from '@starter/types';
import { inviteMember } from '@/app/actions/organization';
import { useLocalePath } from '@/hooks/useLocalePath';

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['member', 'viewer'], {
    required_error: 'Please select a role',
  }),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteFormProps {
  orgId: string;
  onInviteSent?: () => void;
}

const ROLE_LABELS: Record<OrgRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
  member: 'Member',
  viewer: 'Viewer',
};

const ROLE_DESCRIPTIONS: Record<OrgRole, string> = {
  owner: 'Full access to organization and all features',
  admin: 'Can manage members and organization settings',
  editor: 'Can edit content and manage projects',
  member: 'Can manage content and invite teammates',
  viewer: 'Can only view content, cannot make changes',
};

export function InviteForm({ orgId, onInviteSent }: InviteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { locale } = useLocalePath();
  const router = useRouter();

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'viewer',
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    setIsSubmitting(true);
    form.clearErrors();

    startTransition(async () => {
      const formData = new FormData();
      formData.append('org_id', orgId);
      formData.append('email', data.email);
      formData.append('role', data.role);
      formData.append('locale', locale);

      const result = await inviteMember(formData);

      if (result?.error) {
        const errors = result.error as Record<string, string[]>;
        if (errors.email?.[0]) {
          form.setError('email', { message: errors.email[0] });
        }
        if (errors.role?.[0]) {
          form.setError('role', { message: errors.role[0] });
        }
        if (errors.form?.[0]) {
          toast({
            title: 'Failed to send invitation',
            description: errors.form[0],
            variant: 'destructive',
          });
        }
        setIsSubmitting(false);
        return;
      }

      toast({
        title: 'Invitation sent',
        description: `Invitation sent to ${data.email}`,
      });
      form.reset();
      router.refresh();
      setIsSubmitting(false);
      onInviteSent?.();
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Invite team member</h3>
        <p className="text-sm text-muted-foreground">
          Send an invitation to join this organization. They will receive an email with instructions.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      placeholder="colleague@company.com"
                      className="pl-10"
                      type="email"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS)
                      .filter(([role]) => role !== 'owner')
                      .map(([role, label]) => (
                        <SelectItem key={role} value={role}>
                          <div className="flex flex-col">
                            <span>{label}</span>
                            <span className="text-xs text-muted-foreground">
                              {ROLE_DESCRIPTIONS[role as OrgRole]}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting || isPending} className="w-full">
            {isSubmitting || isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending invitation...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Send invitation
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="text-xs text-muted-foreground">
        <p>
          <strong>Note:</strong> Invitations expire after 7 days. The recipient will need to 
          create an account if they don&apos;t already have one.
        </p>
      </div>
    </div>
  );
}

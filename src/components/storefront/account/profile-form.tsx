'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormValues } from '@/core/account/profile.validation';
import { type Profile } from '@/lib/db/schema/auth';
import { FormField } from '@/components/forms/form-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { updateProfileAction } from '@/app/actions/account';
import { toast } from 'sonner';

export interface ProfileFormProps {
  profile: Profile;
}

/**
 * Account Settings Profile update form component.
 */
export function ProfileForm({ profile }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName || '',
      username: profile.username || '',
      phone: profile.phone || '',
      avatarUrl: profile.avatarUrl || '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const result = await updateProfileAction(data);
      if (result.success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.error ?? 'Failed to update profile.');
      }
    } catch {
      toast.error('An unexpected error occurred.');
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm w-full">
      <CardHeader className="p-5 border-b border-border bg-muted/10">
        <Heading level={2} className="text-base font-bold tracking-tight font-heading">
          Profile Settings
        </Heading>
      </CardHeader>

      <CardContent className="p-5">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack gap="4">
            {/* Email (Read-only) */}
            <FormField label="Email Address (Linked)" description="Email cannot be changed." id="email">
              <Input
                id="email"
                type="email"
                value={profile.email || ''}
                disabled
                className="bg-muted text-muted-foreground border-border cursor-not-allowed"
              />
            </FormField>

            {/* Full Name */}
            <FormField label="Full Name" error={errors.fullName?.message} id="fullName">
              <Input
                id="fullName"
                placeholder="John Doe"
                {...register('fullName')}
                className={errors.fullName ? 'border-destructive' : ''}
              />
            </FormField>

            {/* Username */}
            <FormField label="Username" error={errors.username?.message} id="username" description="Used for reviews and profile links.">
              <div className="relative flex items-center">
                <span className="absolute left-3 text-sm text-muted-foreground font-semibold">@</span>
                <Input
                  id="username"
                  placeholder="johndoe"
                  {...register('username')}
                  className={errors.username ? 'border-destructive pl-8' : 'pl-8'}
                />
              </div>
            </FormField>

            {/* Phone */}
            <FormField label="Phone Number" error={errors.phone?.message} id="phone">
              <Input
                id="phone"
                placeholder="+1 (555) 000-0000"
                {...register('phone')}
                className={errors.phone ? 'border-destructive' : ''}
              />
            </FormField>

            {/* Avatar URL (Optional text input for Phase 9) */}
            <FormField label="Avatar Image URL (Optional)" error={errors.avatarUrl?.message} id="avatarUrl" description="Direct URL linking to your profile photo.">
              <Input
                id="avatarUrl"
                placeholder="https://example.com/avatar.jpg"
                {...register('avatarUrl')}
                className={errors.avatarUrl ? 'border-destructive' : ''}
              />
            </FormField>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto sm:self-end font-bold text-xs uppercase cursor-pointer mt-2"
            >
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
export default ProfileForm;

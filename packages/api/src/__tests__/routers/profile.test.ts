import { describe, it, expect, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { profileRouter } from '../../routers/profile';
import { createSupabaseMock } from '../helpers/supabaseMock';

describe('profileRouter', () => {
  const user = { id: 'user-123' };
  let supabase: ReturnType<typeof createSupabaseMock>['supabase'];
  let getTable: ReturnType<typeof createSupabaseMock>['getTable'];
  let caller: ReturnType<typeof profileRouter.createCaller>;

  beforeEach(() => {
    const mock = createSupabaseMock();
    supabase = mock.supabase as any;
    getTable = mock.getTable;
    caller = profileRouter.createCaller({ supabase, user });
  });

  it('returns onboarding status for the user', async () => {
    const users = getTable('users');
    users.single.mockResolvedValue({
      data: { onboarding_completed: true, profile_completed: false, preferences: { theme: 'dark' } },
      error: null,
    });

    const result = await caller.getOnboardingStatus();

    expect(result).toEqual({
      onboardingCompleted: true,
      profileCompleted: false,
      preferences: { theme: 'dark' },
    });
  });

  it('throws when onboarding status cannot be found', async () => {
    const users = getTable('users');
    users.single.mockResolvedValue({ data: null, error: { message: 'missing' } });

    await expect(caller.getOnboardingStatus()).rejects.toBeInstanceOf(TRPCError);
  });

  it('marks profile as complete', async () => {
    const users = getTable('users');
    users.single.mockResolvedValue({
      data: { onboarding_completed: true, profile_completed: true },
      error: null,
    });

    const result = await caller.completeProfile();

    expect(result).toEqual({
      onboardingCompleted: true,
      profileCompleted: true,
    });
    expect(users.update).toHaveBeenCalled();
  });

  it('updates preferences JSON', async () => {
    const users = getTable('users');
    users.single.mockResolvedValue({
      data: { id: user.id, preferences: { locale: 'en' } },
      error: null,
    });

    const result = await caller.updatePreferences({ preferences: { locale: 'en' } });

    expect(result).toEqual({ id: user.id, preferences: { locale: 'en' } });
    expect(users.update).toHaveBeenCalled();
  });
});

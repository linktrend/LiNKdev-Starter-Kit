import { describe, it, expect, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { userRouter } from '../../routers/user';
import { createSupabaseMock } from '../helpers/supabaseMock';

describe('userRouter', () => {
  const user = { id: '00000000-0000-4000-8000-000000000001' };
  let supabase: ReturnType<typeof createSupabaseMock>['supabase'];
  let getTable: ReturnType<typeof createSupabaseMock>['getTable'];
  let caller: ReturnType<typeof userRouter.createCaller>;

  beforeEach(() => {
    const mock = createSupabaseMock();
    supabase = mock.supabase as any;
    getTable = mock.getTable;
    caller = userRouter.createCaller({ supabase, user });
  });

  it('returns the authenticated user profile', async () => {
    const users = getTable('users');
    users.single.mockResolvedValue({ data: { id: user.id, full_name: 'Test User' }, error: null });

    const result = await caller.getProfile();

    expect(result.full_name).toBe('Test User');
    expect(users.select).toHaveBeenCalled();
  });

  it('throws when profile is missing', async () => {
    const users = getTable('users');
    users.single.mockResolvedValue({ data: null, error: { message: 'not found' } });

    await expect(caller.getProfile()).rejects.toBeInstanceOf(TRPCError);
  });

  it('updates profile fields', async () => {
    const users = getTable('users');
    users.single.mockResolvedValue({
      data: { id: user.id, full_name: 'Updated User' },
      error: null,
    });

    const result = await caller.updateProfile({ full_name: 'Updated User' });

    expect(result.full_name).toBe('Updated User');
    expect(users.update).toHaveBeenCalled();
  });

  it('deletes the account', async () => {
    const users = getTable('users');
    users.eq.mockResolvedValue({ error: null });

    const result = await caller.deleteAccount();

    expect(result).toEqual({ success: true, userId: user.id });
    expect(users.delete).toHaveBeenCalled();
  });
});

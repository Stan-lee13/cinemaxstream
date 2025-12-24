import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validatePremiumCode } from '@/utils/authUtils';

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      auth: {
        getUser: () => mockGetUser(),
      },
      from: (table: string) => mockFrom(table),
    },
  };
});

beforeEach(() => {
  mockGetUser.mockReset();
  mockFrom.mockReset();
});

describe('validatePremiumCode', () => {
  it('returns false for empty code without calling supabase', async () => {
    const result = await validatePremiumCode('');
    expect(result).toBe(false);
    expect(mockGetUser).not.toHaveBeenCalled();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns false for short codes without calling supabase', async () => {
    const result = await validatePremiumCode('ABC');
    expect(result).toBe(false);
    expect(mockGetUser).not.toHaveBeenCalled();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns true and updates usage for a valid code', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'user-1' }
      }
    });

    const codeData = {
      id: 'code-1',
      code: 'VALID1',
      is_active: true,
      expires_at: null,
      max_uses: 10,
      current_uses: 0,
      per_user_limit: null,
      months_granted: 1
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === 'premium_codes') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: codeData, error: null })
              })
            })
          }),
          update: () => ({
            eq: async () => ({ data: null, error: null })
          })
        };
      }

      if (table === 'promo_code_redemptions') {
        return {
          select: () => ({
            select: () => ({
              eq: () => ({
                eq: async () => ({ count: 0 })
              })
            })
          }),
          insert: async () => ({ data: null, error: null })
        };
      }

      if (table === 'user_roles') {
        return {
          insert: async () => ({ data: null, error: null })
        };
      }

      if (table === 'user_profiles') {
        return {
          update: () => ({
            eq: async () => ({ data: null, error: null })
          })
        };
      }

      throw new Error(`Unexpected table ${table}`);
    });

    const result = await validatePremiumCode('VALID1');
    expect(result).toBe(true);
    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith('premium_codes');
    expect(mockFrom).toHaveBeenCalledWith('promo_code_redemptions');
    expect(mockFrom).toHaveBeenCalledWith('user_roles');
    expect(mockFrom).toHaveBeenCalledWith('user_profiles');
  });
});


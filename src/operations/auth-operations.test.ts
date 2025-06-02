import { AuthError, SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, test, vi, beforeEach } from 'vitest'

import { mockSupabase } from '@/utils/test-helpers'
import { authOperations } from './auth-operations'

// Test constants
const TEST_ERROR = {
  message: 'Sign out failed',
  status: 400,
} as const

describe('signOut', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should successfully sign out user', async () => {
    // Arrange
    vi.mocked(mockSupabase.auth.signOut).mockResolvedValueOnce({ error: null })

    // Act
    await authOperations.signOut({
      supabaseClient: mockSupabase as unknown as SupabaseClient,
    })

    // Assert
    expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1)
  })

  test('should throw error when sign out fails', async () => {
    // Arrange
    const error = new AuthError(TEST_ERROR.message, TEST_ERROR.status)
    vi.mocked(mockSupabase.auth.signOut).mockResolvedValueOnce({ error })

    // Act & Assert
    await expect(
      authOperations.signOut({
        supabaseClient: mockSupabase as unknown as SupabaseClient,
      })
    ).rejects.toThrow()
  })

  test('should throw error when auth client is not available', async () => {
    // Arrange
    const invalidClient = {} as SupabaseClient

    // Act & Assert
    await expect(authOperations.signOut({ supabaseClient: invalidClient })).rejects.toThrow()
  })
})

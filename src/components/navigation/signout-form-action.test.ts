import { revalidateTag } from 'next/cache'
import { describe, expect, test, vi, beforeEach } from 'vitest'

import { tags } from '@/app/_types/tags'
import { authOperations } from '@/operations/auth-operations'
import { getAuthUserId, isProtectedPath } from '@/utils/auth'
import { createClient } from '@/utils/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { mockSupabase } from '@/utils/test-helpers'

import { SignOutFormAction } from './signout-form-action'

// Test constants
const TEST_USER = {
  id: 'test-user-id',
} as const

const TEST_PATHS = {
  unprotected: '/',
  protected: '/account',
  signIn: '/sign-in',
} as const

vi.mock('@/operations/auth-operations', () => ({
  authOperations: {
    signOut: vi.fn(),
  },
}))

vi.mock('@/utils/auth', () => ({
  getAuthUserId: vi.fn(),
  isProtectedPath: vi.fn(),
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

describe('SignOutFormAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock implementations
    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as SupabaseClient)
    vi.mocked(getAuthUserId).mockResolvedValue(TEST_USER.id)
    vi.mocked(authOperations.signOut).mockResolvedValue(undefined)
    vi.mocked(isProtectedPath).mockReturnValue(false)
  })

  test('should call auth operation with supabase client', async () => {
    // Act
    await SignOutFormAction({ pathname: TEST_PATHS.unprotected })
    // Assert
    expect(createClient).toHaveBeenCalled()
    expect(authOperations.signOut).toHaveBeenCalledWith({ supabaseClient: mockSupabase })
  })

  test('should throw user-friendly error when sign out fails', async () => {
    // Arrange
    vi.mocked(authOperations.signOut).mockRejectedValue(new Error())
    // Act & Assert
    await expect(SignOutFormAction({ pathname: TEST_PATHS.unprotected })).rejects.toThrow('Failed to sign out')
  })

  test('should revalidate user data when user ID is present', async () => {
    // Act
    await SignOutFormAction({ pathname: TEST_PATHS.unprotected })
    // Assert
    expect(revalidateTag).toHaveBeenCalledWith(tags.currentUser(TEST_USER.id))
  })

  test('should redirect to sign-in for protected paths', async () => {
    // Arrange
    vi.mocked(isProtectedPath).mockReturnValue(true)
    // Act
    const result = await SignOutFormAction({ pathname: TEST_PATHS.protected })
    // Assert
    expect(isProtectedPath).toHaveBeenCalledWith(TEST_PATHS.protected)
    expect(result).toEqual({ redirectTo: TEST_PATHS.signIn })
  })

  test('should return current path for unprotected paths', async () => {
    // Arrange
    vi.mocked(isProtectedPath).mockReturnValue(false)
    // Act
    const result = await SignOutFormAction({ pathname: TEST_PATHS.unprotected })
    // Assert
    expect(isProtectedPath).toHaveBeenCalledWith(TEST_PATHS.unprotected)
    expect(result).toEqual({ redirectTo: TEST_PATHS.unprotected })
  })
})

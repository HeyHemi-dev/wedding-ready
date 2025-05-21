import { describe, expect, test, vi, beforeEach } from 'vitest'

import { authActions } from '@/src/app/_actions/auth-actions'
import { isProtectedPath } from '@/utils/auth'

import { SignOutFormAction } from './signout-form-action'

// Mock dependencies
vi.mock('@/app/_actions/auth-actions', () => ({
  authActions: {
    signOut: vi.fn(),
  },
}))

vi.mock('@/utils/auth', () => ({
  isProtectedPath: vi.fn(),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Map([['x-auth-user-id', 'test-user-id']])),
}))

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

const TEST_PATHS = {
  unprotected: '/',
  protected: '/account',
} as const

describe('SignOutFormAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should handle successful sign out', async () => {
    // Arrange
    vi.mocked(authActions.signOut).mockResolvedValueOnce(undefined)
    vi.mocked(isProtectedPath).mockReturnValueOnce(false)

    // Act
    const result = await SignOutFormAction({ pathname: TEST_PATHS.unprotected })

    // Assert
    expect(authActions.signOut).toHaveBeenCalled()
    expect(isProtectedPath).toHaveBeenCalledWith(TEST_PATHS.unprotected)
    expect(result).toEqual({ redirectTo: TEST_PATHS.unprotected })
  })

  test('should redirect to sign-in for protected paths', async () => {
    // Arrange
    vi.mocked(authActions.signOut).mockResolvedValueOnce(undefined)
    vi.mocked(isProtectedPath).mockReturnValueOnce(true)

    // Act
    const result = await SignOutFormAction({ pathname: TEST_PATHS.protected })

    // Assert
    expect(authActions.signOut).toHaveBeenCalled()
    expect(isProtectedPath).toHaveBeenCalledWith(TEST_PATHS.protected)
    expect(result).toEqual({ redirectTo: '/sign-in' })
  })

  test('should throw error on sign out failure', async () => {
    // Arrange
    vi.mocked(authActions.signOut).mockRejectedValueOnce(new Error())

    // Act & Assert
    await expect(SignOutFormAction({ pathname: TEST_PATHS.unprotected })).rejects.toThrow()
  })
})

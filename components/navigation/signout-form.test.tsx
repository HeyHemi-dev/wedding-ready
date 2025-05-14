import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { usePathname, useRouter } from 'next/navigation'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { toast } from 'sonner'

import { SignOutForm } from './signout-form'
import { SignOutFormAction } from './signout-form-action'

// Mock dependencies
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}))

vi.mock('./signout-form-action', () => ({
  SignOutFormAction: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

const mockRouter = {
  back: vi.fn(),
  forward: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
}

const TEST_PATHS = {
  current: '/account',
  signIn: '/sign-in',
} as const

const TEST_ACTIONS = {
  success: { redirectTo: TEST_PATHS.signIn },
  error: new Error('Sign out failed'),
} as const

describe('SignOutForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue(mockRouter)
    vi.mocked(usePathname).mockReturnValue(TEST_PATHS.current)
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  const renderSignOutForm = () => {
    const { unmount } = render(<SignOutForm />)
    return { unmount }
  }

  test('should handle successful sign out', async () => {
    // Arrange
    vi.mocked(SignOutFormAction).mockResolvedValueOnce(TEST_ACTIONS.success)
    const { unmount } = renderSignOutForm()

    // Act
    const signOutButton = screen.getByTestId('sign-out')
    fireEvent.click(signOutButton)

    // Assert
    await waitFor(() => {
      expect(SignOutFormAction).toHaveBeenCalledWith({
        pathname: TEST_PATHS.current,
      })
      expect(mockRouter.push).toHaveBeenCalledWith(TEST_ACTIONS.success.redirectTo)
      expect(mockRouter.refresh).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalled()
    })

    unmount()
  })

  test('should handle sign out error', async () => {
    // Arrange
    vi.mocked(SignOutFormAction).mockRejectedValueOnce(TEST_ACTIONS.error)
    const { unmount } = renderSignOutForm()

    // Act
    const signOutButton = screen.getByTestId('sign-out')
    fireEvent.click(signOutButton)

    // Assert
    await waitFor(() => {
      expect(SignOutFormAction).toHaveBeenCalledWith({
        pathname: TEST_PATHS.current,
      })
      expect(mockRouter.push).not.toHaveBeenCalled()
      expect(mockRouter.refresh).not.toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalled()
    })

    unmount()
  })
})

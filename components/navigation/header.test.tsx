import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import * as t from '@/models/types'

import { getCurrentUser } from '@/app/_actions/get-current-user'
import Header from './header'

// Mock dependencies
vi.mock('@/app/_actions/get-current-user', () => ({
  getCurrentUser: vi.fn(),
}))

const TEST_USER: t.UserDetailRaw = {
  id: 'test-user-id',
  handle: 'testuser',
  displayName: 'Test User',
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: new Date(),
  updatedAt: new Date(),
  handleUpdatedAt: new Date(),
  bio: null,
  instagramUrl: null,
  tiktokUrl: null,
  websiteUrl: null,
} as const

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('should show sign-in/sign-up when user is not authenticated', async () => {
    // Arrange
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null)

    // Act
    render(await Header())

    // Assert
    expect(screen.getByTestId('sign-in')).toBeInTheDocument()
    expect(screen.getByTestId('sign-up')).toBeInTheDocument()
    expect(screen.queryByTestId('user-menu-trigger')).not.toBeInTheDocument()
  })

  test('should show user menu when user is authenticated', async () => {
    // Arrange
    vi.mocked(getCurrentUser).mockResolvedValueOnce(TEST_USER)

    // Act
    render(await Header())
    const userMenuTrigger = await screen.getByTestId('user-menu-trigger')

    // Assert
    expect(userMenuTrigger).toBeInTheDocument()
    expect(screen.queryByTestId('sign-in')).not.toBeInTheDocument()
    expect(screen.queryByTestId('sign-up')).not.toBeInTheDocument()
  })
})

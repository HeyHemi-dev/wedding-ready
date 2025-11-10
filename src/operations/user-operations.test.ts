import { afterAll, afterEach, describe, expect, it } from 'vitest'

import { scene } from '@/testing/scene'
import { createAdminClient } from '@/utils/supabase/server'

import { userOperations } from './user-operations'

const TEST_USER_OPERATIONS = {
  email: 'testUserOperations@example.com',
  password: 'testpassword123',
  displayName: 'Test User Operations',
  handle: 'testUserOperations',
}

describe('userOperations', () => {
  const supabaseAdmin = createAdminClient()

  afterEach(async () => {
    await scene.withoutUser({ handle: TEST_USER_OPERATIONS.handle })
  })

  afterAll(async () => {
    await scene.resetTestData()
    await scene.withoutUser({ handle: TEST_USER_OPERATIONS.handle })
  })

  describe('getById', () => {
    it('should get a user by id', async () => {
      // Arrange
      const testUser = await scene.hasUser({ ...TEST_USER_OPERATIONS, supabaseClient: supabaseAdmin })

      // Act
      const user = await userOperations.getById(testUser.id)

      // Assert
      expect(user).toBeDefined()
      expect(user.id).toBe(testUser.id)
      expect(user.displayName).toBe(TEST_USER_OPERATIONS.displayName)
    })
  })

  describe('getByHandle', () => {
    it('should get a user by handle', async () => {
      // Arrange
      const testUser = await scene.hasUser({ ...TEST_USER_OPERATIONS, supabaseClient: supabaseAdmin })

      // Act
      const user = await userOperations.getByHandle(testUser.handle)

      // Assert
      expect(user).toBeDefined()
      expect(user?.id).toBe(testUser.id)
      expect(user?.displayName).toBe(TEST_USER_OPERATIONS.displayName)
    })
    it('should return null if the user is not found', async () => {
      // Arrange
      await scene.withoutUser({ handle: 'nonexistent' })

      // Act
      const user = await userOperations.getByHandle('nonexistent')

      // Assert
      expect(user).toBeNull()
    })
  })

  describe('updateProfile', () => {
    it('should update a user profile', async () => {
      // Arrange
      const user = await scene.hasUser({ ...TEST_USER_OPERATIONS, supabaseClient: supabaseAdmin })

      // Act
      const updatedUser = await userOperations.updateProfile(
        {
          id: user.id,
          displayName: 'Updated User',
          bio: 'Updated Bio',
          avatarUrl: 'https://example.com/avatar.jpg',
          instagramUrl: 'https://instagram.com/example',
          tiktokUrl: 'https://tiktok.com/example',
          websiteUrl: 'https://example.com',
        },
        user.id
      )

      // Assert
      expect(updatedUser).toBeDefined()
      expect(updatedUser.id).toBe(user.id)
      expect(user.displayName).toBe(TEST_USER_OPERATIONS.displayName)
      expect(updatedUser.displayName).toBe('Updated User')
    })
    it('should throw an error if the user is not found', async () => {
      // Arrange,
      const fakeUserId = '00000000-0000-0000-0000-000000000000'

      // Act & Assert
      await expect(
        userOperations.updateProfile(
          {
            id: fakeUserId,
            displayName: 'Updated User',
            bio: 'Updated Bio',
            avatarUrl: 'https://example.com/avatar.jpg',
            instagramUrl: 'https://instagram.com/example',
            tiktokUrl: 'https://tiktok.com/example',
            websiteUrl: 'https://example.com',
          },
          fakeUserId
        )
      ).rejects.toThrow()
    })
    it('should throw an error if the user is not the current user', async () => {
      // Arrange
      const user = await scene.hasUser({ ...TEST_USER_OPERATIONS, supabaseClient: supabaseAdmin })
      const fakeUserId = '00000000-0000-0000-0000-000000000000'

      // Act & Assert
      await expect(
        userOperations.updateProfile(
          {
            id: user.id,
            displayName: 'Updated User',
            bio: 'Updated Bio',
            avatarUrl: 'https://example.com/avatar.jpg',
            instagramUrl: 'https://instagram.com/example',
            tiktokUrl: 'https://tiktok.com/example',
            websiteUrl: 'https://example.com',
          },
          fakeUserId
        )
      ).rejects.toThrow()
    })
    it('should handle empty strings as null', async () => {
      // Arrange
      const user = await scene.hasUser({ ...TEST_USER_OPERATIONS, supabaseClient: supabaseAdmin })

      // Act
      await userOperations.updateProfile(
        {
          id: user.id,
          displayName: 'Updated User',
          bio: 'Updated Bio',
          avatarUrl: 'https://example.com/avatar.jpg',
          instagramUrl: 'https://instagram.com/example',
          tiktokUrl: 'https://tiktok.com/example',
          websiteUrl: 'https://example.com',
        },
        user.id
      )
      const updatedUser = await userOperations.updateProfile(
        {
          id: user.id,
          displayName: 'Updated User',
          bio: 'Updated Bio',
          avatarUrl: '',
          instagramUrl: '',
          tiktokUrl: '',
          websiteUrl: '',
        },
        user.id
      )

      // Assert
      expect(updatedUser).toBeDefined()
      expect(updatedUser.id).toBe(user.id)
      expect(updatedUser.displayName).toBe('Updated User')
      expect(updatedUser.bio).toBe('Updated Bio')
      expect(updatedUser.avatarUrl).toBeNull()
      expect(updatedUser.instagramUrl).toBeNull()
      expect(updatedUser.tiktokUrl).toBeNull()
      expect(updatedUser.websiteUrl).toBeNull()
    })
  })
})

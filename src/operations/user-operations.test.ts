import { scene } from '@/testing/scene'
import { afterAll, afterEach, describe, expect, it } from 'vitest'
import { userOperations } from './user-operations'
import { createAdminClient } from '@/utils/supabase/server'

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

  describe('updateProfile', () => {
    it('should update a user profile', async () => {
      // Arrange
      const user = await scene.hasUser({ ...TEST_USER_OPERATIONS, supabaseClient: supabaseAdmin })

      // Act
      const updatedUser = await userOperations.updateProfile({
        id: user.id,
        displayName: 'Updated User',
        bio: 'Updated Bio',
        avatarUrl: 'https://example.com/avatar.jpg',
        instagramUrl: 'https://example.com/instagram',
        tiktokUrl: 'https://example.com/tiktok',
        websiteUrl: 'https://example.com',
      })

      // Assert
      expect(updatedUser).toBeDefined()
      expect(updatedUser.id).toBe(user.id)
      expect(user.displayName).toBe(TEST_USER_OPERATIONS.displayName)
      expect(updatedUser.displayName).toBe('Updated User')
    })
  })
})

import { randomUUID } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { UserSignupForm } from '@/app/_types/validation-schema'
import { scene, testClient, TEST_ID_0, TEST_ORIGIN } from '@/testing/scene'
import { tryCatch } from '@/utils/try-catch'

import { authOperations, SIGN_UP_STATUS } from './auth-operations'

// Define different test users only for auth testing so we can create a delete as needed without affecting other tests
const AUTH_TEST_USER_1 = {
  email: 'auth.test.user@example.com',
  password: 'testpassword123',
  displayName: 'Test User',
  handle: 'authuser',
}

const AUTH_TEST_USER_2 = {
  email: 'auth.test.user2@example.com',
  password: 'testpassword123',
  displayName: 'Test User 2',
  handle: 'authuser2',
}

function uniqueAuthTestUser(overrides: Partial<typeof AUTH_TEST_USER_1> = {}) {
  const suffix = randomUUID().slice(0, 8)
  return {
    ...AUTH_TEST_USER_1,
    email: `auth.test.user+${suffix}@example.com`,
    handle: `authuser${suffix}`,
    ...overrides,
  }
}

describe('authOperations', () => {
  // Track created test user IDs to clean up after tests
  const createdTestUserIds = new Set<string>()
  const addTestUserToCleanup = (id: string) => createdTestUserIds.add(id)
  const cleanUpTestUsers = async () => {
    await Promise.all(
      Array.from(createdTestUserIds).map(async (id) => {
        const { error } = await tryCatch(testClient.auth.admin.deleteUser(id))
        if (error) {
          console.error('Error cleaning up test user:', error)
          return Promise.resolve(null)
        }
        createdTestUserIds.delete(id)
      })
    )
  }

  beforeEach(async () => {
    scene.startTest()
    await Promise.all([
      scene.withoutUser({ handle: AUTH_TEST_USER_1.handle, supabaseClient: testClient }),
      scene.withoutUser({ handle: AUTH_TEST_USER_2.handle, supabaseClient: testClient }),
      cleanUpTestUsers(),
    ])
  })

  afterEach(async () => {
    await Promise.all([
      scene.endTest(),
      scene.withoutUser({ handle: AUTH_TEST_USER_1.handle, supabaseClient: testClient }),
      scene.withoutUser({ handle: AUTH_TEST_USER_2.handle, supabaseClient: testClient }),
      cleanUpTestUsers(),
    ])
  })

  describe('signUp', () => {
    test('should successfully create a new user account', async () => {
      const authUser = uniqueAuthTestUser()

      // Act
      const testUser = await authOperations.signUp({
        userSignFormData: authUser,
        supabaseClient: testClient,
        origin: TEST_ORIGIN,
      })
      addTestUserToCleanup(testUser.id)

      // Assert
      expect(testUser).toBeDefined()
      expect(testUser.id).toBeDefined()

      // Verify user exists in auth
      const { data: authUserData } = await testClient.auth.admin.getUserById(testUser.id)
      expect(authUserData.user).toBeDefined()
      expect(authUserData.user?.email).toBe(authUser.email)
    })

    test('should throw error when email is already taken', async () => {
      const authUser = uniqueAuthTestUser()
      const existing = await authOperations.signUp({
        userSignFormData: authUser,
        supabaseClient: testClient,
        origin: TEST_ORIGIN,
      })
      addTestUserToCleanup(existing.id)

      // Use same email as first user
      const userSignupData: UserSignupForm = {
        email: authUser.email,
        password: authUser.password,
      }

      // Act & Assert
      await expect(authOperations.signUp({ userSignFormData: userSignupData, supabaseClient: testClient, origin: TEST_ORIGIN })).rejects.toThrow()
    })
  })

  describe('completeOnboarding', () => {
    test('should successfully complete onboarding', async () => {
      const authUser = uniqueAuthTestUser()

      // Arrange
      const testUser = await authOperations.signUp({
        userSignFormData: authUser,
        supabaseClient: testClient,
        origin: TEST_ORIGIN,
      })
      addTestUserToCleanup(testUser.id)

      // Act
      const result = await authOperations.completeOnboarding(testUser.id, {
        handle: authUser.handle,
        displayName: authUser.displayName,
        avatarUrl: '',
      })

      // Assert
      expect(result).toBeDefined()
      expect(result.id).toBe(testUser.id)
      expect(result.handle).toBe(authUser.handle)
      expect(result.displayName).toBe(authUser.displayName)
    })

    test('should throw error when user is not found', async () => {
      const authUser = uniqueAuthTestUser()

      await expect(
        authOperations.completeOnboarding(TEST_ID_0, {
          handle: authUser.handle,
          displayName: authUser.displayName,
          avatarUrl: '',
        })
      ).rejects.toThrow()
    })

    test('should throw error when handle is already taken', async () => {
      const authUser1 = uniqueAuthTestUser()
      const authUser2 = uniqueAuthTestUser()

      const first = await authOperations.signUp({
        userSignFormData: authUser1,
        supabaseClient: testClient,
        origin: TEST_ORIGIN,
      })
      const second = await authOperations.signUp({
        userSignFormData: authUser2,
        supabaseClient: testClient,
        origin: TEST_ORIGIN,
      })
      addTestUserToCleanup(first.id)
      addTestUserToCleanup(second.id)

      await authOperations.completeOnboarding(first.id, {
        handle: authUser1.handle,
        displayName: authUser1.displayName,
        avatarUrl: '',
      })

      await expect(
        authOperations.completeOnboarding(second.id, {
          handle: authUser1.handle,
          displayName: authUser2.displayName,
          avatarUrl: '',
        })
      ).rejects.toThrow()
    })
  })

  describe('getUserSignUpStatus', () => {
    test('should return the user sign up status', async () => {
      // Arrange
      const testUser = await scene.hasUser({ ...AUTH_TEST_USER_1, supabaseClient: testClient })

      // Act
      const result = await authOperations.getUserSignUpStatus(testClient)

      // Assert
      expect(result).toBeDefined()
      expect(result?.status).toBeDefined()
      expect(result?.authUserId).toBe(testUser.id)
    })

    test('should return SIGN_UP_STATUS.VERIFIED when user is verified but no profile is created', async () => {
      const authUser = uniqueAuthTestUser()
      // Arrange
      const testUser = await authOperations.signUp({
        userSignFormData: authUser,
        supabaseClient: testClient,
        origin: TEST_ORIGIN,
      })
      addTestUserToCleanup(testUser.id)

      // Act
      const result = await authOperations.getUserSignUpStatus(testClient)

      // Assert
      expect(result).toBeDefined()
      expect(result?.status).toBe(SIGN_UP_STATUS.VERIFIED)
      expect(result?.authUserId).toBe(testUser.id)
    })

    test('should return SIGN_UP_STATUS.ONBOARDED when user is verified and profile is created', async () => {
      const authUser = uniqueAuthTestUser()
      // Arrange
      const testUser = await authOperations.signUp({
        userSignFormData: authUser,
        supabaseClient: testClient,
        origin: TEST_ORIGIN,
      })
      addTestUserToCleanup(testUser.id)
      await authOperations.completeOnboarding(testUser.id, {
        handle: authUser.handle,
        displayName: authUser.displayName,
        avatarUrl: '',
      })

      // Act
      const result = await authOperations.getUserSignUpStatus(testClient)

      // Assert
      expect(result).toBeDefined()
      expect(result?.authUserId).toBe(testUser.id)
      expect(result?.status).toBe(SIGN_UP_STATUS.ONBOARDED)
    })
  })

  describe('signIn', () => {
    test('should successfully sign in existing user', async () => {
      // Arrange
      const testUser = await scene.hasUser({ ...AUTH_TEST_USER_1, supabaseClient: testClient })

      // Act
      const result = await authOperations.signIn({
        userSigninFormData: {
          email: testUser.email,
          password: AUTH_TEST_USER_1.password,
        },
        supabaseClient: testClient,
      })

      // Assert
      expect(result).toBeDefined()
      expect(result.authUserId).toBe(testUser.id)
    })

    test('should throw error when credentials are invalid', async () => {
      // Act & Assert
      await expect(
        authOperations.signIn({
          userSigninFormData: {
            email: 'nonexistent@example.com',
            password: 'wrongpassword',
          },
          supabaseClient: testClient,
        })
      ).rejects.toThrow()
    })
  })

  describe('signOut', () => {
    test('should successfully sign out user', async () => {
      // Arrange

      // Create and sign in user
      const created = await scene.hasUser({ ...AUTH_TEST_USER_1, supabaseClient: testClient })

      await authOperations.signIn({
        userSigninFormData: {
          email: created.email,
          password: AUTH_TEST_USER_1.password,
        },
        supabaseClient: testClient,
      })

      // Act & Assert
      await expect(authOperations.signOut({ supabaseClient: testClient })).resolves.not.toThrow()
    })
  })

  /* Skip testing email update flow
   * authOperations.updateEmail calls updateUser which requires client side session to be present.
   */

  /* Skip testing password reset flow
   * The password reset flow involves:
   * - Client side session to be present
   * - Email delivery of reset tokens
   * - Time-sensitive tokens generated by Supabase
   * - Complex session management during reset process
   */
})

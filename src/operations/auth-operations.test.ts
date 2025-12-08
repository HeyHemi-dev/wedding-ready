import { describe, expect, test, beforeEach, afterAll } from 'vitest'

import { UserSignupForm } from '@/app/_types/validation-schema'
import { userProfileModel } from '@/models/user'
import { scene, testClient, TEST_ORIGIN } from '@/testing/scene'

import { authOperations } from './auth-operations'

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

describe('authOperations', () => {
  beforeEach(async () => {
    await Promise.all([
      scene.withoutUser({ handle: AUTH_TEST_USER_1.handle, supabaseClient: testClient }),
      scene.withoutUser({ handle: AUTH_TEST_USER_2.handle, supabaseClient: testClient }),
    ])
  })

  afterAll(async () => {
    await Promise.all([
      scene.withoutUser({ handle: AUTH_TEST_USER_1.handle, supabaseClient: testClient }),
      scene.withoutUser({ handle: AUTH_TEST_USER_2.handle, supabaseClient: testClient }),
      scene.resetTestData(),
    ])
  })

  describe('signUp', () => {
    test('should successfully create a new user account', async () => {
      // Act
      const testUser = await authOperations.signUp({
        userSignFormData: AUTH_TEST_USER_1,
        supabaseClient: testClient,
        origin: TEST_ORIGIN,
      })

      // Assert
      expect(testUser).toBeDefined()
      expect(testUser.id).toBeDefined()
      expect(testUser.handle).toBe(AUTH_TEST_USER_1.handle)
      expect(testUser.displayName).toBe(AUTH_TEST_USER_1.displayName)

      // Verify user exists in auth
      const { data: authUser } = await testClient.auth.admin.getUserById(testUser.id)
      expect(authUser.user).toBeDefined()
      expect(authUser.user?.email).toBe(AUTH_TEST_USER_1.email)

      // Verify user exists in db
      const user = await userProfileModel.getRawByHandle(AUTH_TEST_USER_1.handle)
      expect(user).toBeDefined()
      expect(user?.id).toBe(testUser.id)
      expect(user?.id).toBe(authUser.user?.id)
      expect(user?.displayName).toBe(AUTH_TEST_USER_1.displayName)
    })

    test('should throw error when email is already taken', async () => {
      // Arrange
      await scene.hasUser({ ...AUTH_TEST_USER_1, supabaseClient: testClient })

      // Use same email as first user
      const userSignupData: UserSignupForm = {
        email: AUTH_TEST_USER_1.email,
        password: AUTH_TEST_USER_2.password,
        displayName: AUTH_TEST_USER_2.displayName,
        handle: AUTH_TEST_USER_2.handle,
      }

      // Act & Assert

      await expect(
        authOperations.signUp({
          userSignFormData: userSignupData,
          supabaseClient: testClient,
          origin: TEST_ORIGIN,
        })
      ).rejects.toThrow()
    })

    test('should throw error when handle is already taken', async () => {
      // Arrange
      await scene.hasUser({ ...AUTH_TEST_USER_1, supabaseClient: testClient })

      // Use same handle as first user
      const userSignupData: UserSignupForm = {
        email: AUTH_TEST_USER_2.email,
        password: AUTH_TEST_USER_2.password,
        displayName: AUTH_TEST_USER_2.displayName,
        handle: AUTH_TEST_USER_1.handle,
      }

      // Act & Assert
      await expect(
        authOperations.signUp({
          userSignFormData: userSignupData,
          supabaseClient: testClient,
          origin: TEST_ORIGIN,
        })
      ).rejects.toThrow()
    })
  })

  describe('signIn', () => {
    test('should successfully sign in existing user', async () => {
      // Arrange
      const testUser = await scene.hasUser({ ...AUTH_TEST_USER_1, supabaseClient: testClient })

      // Act
      const result = await authOperations.signIn({
        userSigninFormData: {
          email: AUTH_TEST_USER_1.email,
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
      await scene.hasUser({ ...AUTH_TEST_USER_1, supabaseClient: testClient })

      await authOperations.signIn({
        userSigninFormData: {
          email: AUTH_TEST_USER_1.email,
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

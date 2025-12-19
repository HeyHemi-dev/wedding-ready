import { describe, expect, test, beforeEach, afterAll } from 'vitest'

import { UserSignupForm } from '@/app/_types/validation-schema'

import { scene, testClient, TEST_ORIGIN } from '@/testing/scene'

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

      // Verify user exists in auth
      const { data: authUser } = await testClient.auth.admin.getUserById(testUser.id)
      expect(authUser.user).toBeDefined()
      expect(authUser.user?.email).toBe(AUTH_TEST_USER_1.email)

      // Clean up
      testClient.auth.admin.deleteUser(testUser.id)
    })

    test('should throw error when email is already taken', async () => {
      // Arrange
      await scene.hasUser({ ...AUTH_TEST_USER_1, supabaseClient: testClient })

      // Use same email as first user
      const userSignupData: UserSignupForm = {
        email: AUTH_TEST_USER_1.email,
        password: AUTH_TEST_USER_1.password,
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

  describe('completeOnboarding', () => {
    test('should successfully complete onboarding', async () => {
      // Arrange
      const testUser = await authOperations.signUp({
        userSignFormData: AUTH_TEST_USER_1,
        supabaseClient: testClient,
        origin: TEST_ORIGIN,
      })

      // Act
      const result = await authOperations.completeOnboarding(testUser.id, {
        handle: AUTH_TEST_USER_1.handle,
        displayName: AUTH_TEST_USER_1.displayName,
        avatarUrl: '',
      })

      // Assert
      expect(result).toBeDefined()
      expect(result.id).toBe(testUser.id)
      expect(result.handle).toBe(AUTH_TEST_USER_1.handle)
      expect(result.displayName).toBe(AUTH_TEST_USER_1.displayName)
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
      // Arrange
      const testUser = await authOperations.signUp({
        userSignFormData: AUTH_TEST_USER_1,
        supabaseClient: testClient,
        origin: TEST_ORIGIN,
      })

      // Act
      const result = await authOperations.getUserSignUpStatus(testClient)

      // Assert
      expect(result).toBeDefined()
      expect(result?.status).toBe(SIGN_UP_STATUS.VERIFIED)
      expect(result?.authUserId).toBe(testUser.id)

      // Clean up
      testClient.auth.admin.deleteUser(testUser.id)
    })

    test('should return SIGN_UP_STATUS.ONBOARDED when user is verified and profile is created', async () => {
      // Arrange
      const testUser = await authOperations.signUp({
        userSignFormData: AUTH_TEST_USER_1,
        supabaseClient: testClient,
        origin: TEST_ORIGIN,
      })
      await authOperations.completeOnboarding(testUser.id, {
        handle: AUTH_TEST_USER_1.handle,
        displayName: AUTH_TEST_USER_1.displayName,
        avatarUrl: '',
      })

      // Act
      const result = await authOperations.getUserSignUpStatus(testClient)

      // Assert
      expect(result).toBeDefined()
      expect(result?.authUserId).toBe(testUser.id)
      expect(result?.status).toBe(SIGN_UP_STATUS.ONBOARDED)

      // Clean up
      testClient.auth.admin.deleteUser(testUser.id)
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

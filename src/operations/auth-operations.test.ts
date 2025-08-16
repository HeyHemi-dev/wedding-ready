import { describe, expect, test, beforeEach, afterEach } from 'vitest'

import { createAdminClient } from '@/utils/supabase/server'
import { scene, TEST_ORIGIN } from '@/testing/scene'
import { authOperations } from './auth-operations'
import { UserDetailModel } from '@/models/user'
import { UserSignupForm } from '@/app/_types/validation-schema'
import { UserDetailRaw } from '@/models/types'
import { db } from '@/db/connection'
import * as s from '@/db/schema'
import { eq } from 'drizzle-orm'

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

describe('authOperations - Integration Tests', () => {
  // Create a single admin client instance to reuse across all tests
  const supabaseAdmin = createAdminClient()

  beforeEach(async () => {
    const [testUser1, testUser2] = await Promise.all([
      UserDetailModel.getByHandle(AUTH_TEST_USER_1.handle),
      UserDetailModel.getByHandle(AUTH_TEST_USER_2.handle),
    ])

    if (testUser1) {
      await supabaseAdmin.auth.admin.deleteUser(testUser1.id)
      await db.delete(s.user_details).where(eq(s.user_details.id, testUser1.id))
    }
    if (testUser2) {
      await supabaseAdmin.auth.admin.deleteUser(testUser2.id)
      await db.delete(s.user_details).where(eq(s.user_details.id, testUser2.id))
    }
  })

  afterEach(async () => {})

  describe('signUp', () => {
    test('should successfully create a new user account', async () => {
      // Act
      const testUser = await authOperations.signUp({
        userSignFormData: AUTH_TEST_USER_1,
        supabaseClient: supabaseAdmin,
        origin: TEST_ORIGIN,
      })

      // Assert
      expect(testUser).toBeDefined()
      expect(testUser.id).toBeDefined()
      expect(testUser.handle).toBe(AUTH_TEST_USER_1.handle)
      expect(testUser.displayName).toBe(AUTH_TEST_USER_1.displayName)

      // Verify user exists in auth
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(testUser.id)
      expect(authUser.user).toBeDefined()
      expect(authUser.user?.email).toBe(AUTH_TEST_USER_1.email)

      // Verify user exists in db
      const user = await UserDetailModel.getByHandle(AUTH_TEST_USER_1.handle)
      expect(user).toBeDefined()
      expect(user?.id).toBe(testUser.id)
      expect(user?.id).toBe(authUser.user?.id)
      expect(user?.displayName).toBe(AUTH_TEST_USER_1.displayName)
    })

    test('should throw error when email is already taken', async () => {
      // Arrange
      await scene.hasUser({ ...AUTH_TEST_USER_1, supabaseClient: supabaseAdmin })

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
          supabaseClient: supabaseAdmin,
          origin: TEST_ORIGIN,
        })
      ).rejects.toThrow()
    })

    test('should throw error when handle is already taken', async () => {
      // Arrange
      await scene.hasUser({ ...AUTH_TEST_USER_1, supabaseClient: supabaseAdmin })

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
          supabaseClient: supabaseAdmin,
          origin: TEST_ORIGIN,
        })
      ).rejects.toThrow()
    })
  })

  describe('signIn', () => {
    test('should successfully sign in existing user', async () => {
      // Arrange - Create user first
      const testUser = await scene.hasUser({ ...AUTH_TEST_USER_1, supabaseClient: supabaseAdmin })

      // Act
      const result = await authOperations.signIn({
        userSigninFormData: {
          email: AUTH_TEST_USER_1.email,
          password: AUTH_TEST_USER_1.password,
        },
        supabaseClient: supabaseAdmin,
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
          supabaseClient: supabaseAdmin,
        })
      ).rejects.toThrow()
    })
  })

  describe('signOut', () => {
    test('should successfully sign out user', async () => {
      // Arrange - Create and sign in user
      await scene.hasUser({ ...AUTH_TEST_USER_1, supabaseClient: supabaseAdmin })

      await authOperations.signIn({
        userSigninFormData: {
          email: AUTH_TEST_USER_1.email,
          password: AUTH_TEST_USER_1.password,
        },
        supabaseClient: supabaseAdmin,
      })

      // Act
      await expect(authOperations.signOut({ supabaseClient: supabaseAdmin })).resolves.not.toThrow()
    })
  })

  /*
   * Skip testing password reset flow
   *
   * The password reset flow involves:
   * - Email delivery of reset tokens (external dependency)
   * - Time-sensitive tokens generated by Supabase
   * - Complex session management during reset process
   *
   * Testing this would require mocking email services and Supabase auth internals, which adds significant complexity for minimal testing value.
   */
})

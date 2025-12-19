import { SupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

import { OPERATION_ERROR } from '@/app/_types/errors'
import {
  UserSignupForm,
  UserSigninForm,
  UserForgotPasswordForm,
  UserResetPasswordForm,
  UserUpdateEmailForm,
  OnboardingForm,
} from '@/app/_types/validation-schema'
import * as t from '@/models/types'
import { userProfileModel } from '@/models/user'
import { handleSupabaseSignUpAuthResponse } from '@/utils/auth'
import { PARAMS } from '@/utils/constants'
import { encodedRedirect } from '@/utils/encoded-redirect'
import { tryCatch } from '@/utils/try-catch'

export const authOperations = {
  signUp,
  signUpWithGoogle,
  completeOnboarding,
  getUserSignUpStatus,
  signIn,
  signOut,
  forgotPassword,
  resetPassword,
  updateEmail,
  resendEmailConfirmation,
}

async function signUp({
  userSignFormData,
  supabaseClient,
  origin,
}: {
  userSignFormData: UserSignupForm
  supabaseClient: SupabaseClient
  origin: string
}): Promise<{ id: string }> {
  const { email, password } = userSignFormData

  // Create supabase user for auth only
  const { data: authResponse, error: signUpError } = await tryCatch(
    supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })
  )

  if (signUpError) {
    // Complete failure (network, etc)
    console.error('Auth error:', signUpError)
    throw new Error('Failed to create account')
  }
  const user = handleSupabaseSignUpAuthResponse(authResponse)

  return { id: user.id }
}

async function signUpWithGoogle({ supabaseClient, origin }: { supabaseClient: SupabaseClient; origin: string }) {
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error(error.message)
    encodedRedirect(PARAMS.ERROR, `${origin}/sign-in`, error.message)
  }

  if (data.url) {
    redirect(data.url)
  }
}

async function completeOnboarding(authUserId: string, { handle, displayName }: OnboardingForm): Promise<t.UserProfileRaw> {
  const isAvailable = await userProfileModel.isHandleAvailable(handle)
  if (!isAvailable) {
    throw new Error('Handle is already taken')
  }

  const { data: userDetails, error: dbError } = await tryCatch(
    userProfileModel.createRaw({
      id: authUserId,
      handle,
      displayName,
    })
  )

  if (dbError) {
    console.error('Failed to create user details:', dbError)
    throw new Error('Failed to create profile')
  }

  return userDetails
}

export const SIGN_UP_STATUS = {
  UNVERIFIED: 'unverified',
  VERIFIED: 'verified',
  ONBOARDED: 'onboarded',
} as const

export type SignUpStatus = (typeof SIGN_UP_STATUS)[keyof typeof SIGN_UP_STATUS]

export type UserWithSignUpStatus =
  | null
  | {
      status: typeof SIGN_UP_STATUS.UNVERIFIED
      authUserId: string
      email: string
    }
  | {
      status: typeof SIGN_UP_STATUS.VERIFIED
      authUserId: string
      email: string
    }
  | {
      status: typeof SIGN_UP_STATUS.ONBOARDED
      authUserId: string
    }

async function getUserSignUpStatus(supabaseClient: SupabaseClient): Promise<UserWithSignUpStatus> {
  const {
    data: { user },
    error: authError,
  } = await supabaseClient.auth.getUser()

  if (authError) {
    console.error(authError.message)
    throw OPERATION_ERROR.NOT_AUTHENTICATED(authError.message)
  }
  if (!user) return null

  const authUserId = user.id
  const email = user.email || ''

  if (!user.email_confirmed_at) {
    return { status: SIGN_UP_STATUS.UNVERIFIED, authUserId, email }
  }

  const { data, error: profileError } = await tryCatch(userProfileModel.getRawById(authUserId))
  if (profileError) {
    console.error(profileError.message)
    throw OPERATION_ERROR.DATABASE_ERROR(profileError.message)
  }

  if (!data) return { status: SIGN_UP_STATUS.VERIFIED, authUserId, email }
  if (data) return { status: SIGN_UP_STATUS.ONBOARDED, authUserId }

  // Should never happen
  throw OPERATION_ERROR.INVALID_STATE()
}

async function signIn({
  userSigninFormData,
  supabaseClient,
}: {
  userSigninFormData: UserSigninForm
  supabaseClient: SupabaseClient
}): Promise<{ authUserId: string }> {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: userSigninFormData.email,
    password: userSigninFormData.password,
  })

  if (error) {
    console.error(error.message)
    throw new Error()
  }

  return { authUserId: data.user.id }
}

async function signOut({ supabaseClient }: { supabaseClient: SupabaseClient }) {
  const { error } = await supabaseClient.auth.signOut()
  if (error) {
    console.error(error.message)
    throw new Error()
  }
}

async function forgotPassword({
  forgotPasswordFormData,
  supabaseClient,
}: {
  forgotPasswordFormData: UserForgotPasswordForm
  supabaseClient: SupabaseClient
  origin: string
}) {
  const { error } = await supabaseClient.auth.resetPasswordForEmail(forgotPasswordFormData.email)

  if (error) {
    console.error(error.message)
    throw new Error()
  }
}

async function resetPassword({
  resetPasswordFormData,
  supabaseClient,
}: {
  resetPasswordFormData: UserResetPasswordForm
  supabaseClient: SupabaseClient
}): Promise<{ authUserId: string }> {
  const { data, error } = await supabaseClient.auth.updateUser({
    password: resetPasswordFormData.password,
  })

  if (error) {
    console.error(error.message)
    throw new Error()
  }

  return { authUserId: data.user.id }
}

async function updateEmail({
  updateEmailFormData,
  supabaseClient,
}: {
  updateEmailFormData: UserUpdateEmailForm
  supabaseClient: SupabaseClient
}): Promise<{ authUserId: string }> {
  const { data, error } = await supabaseClient.auth.updateUser({
    email: updateEmailFormData.email,
  })

  if (error) {
    console.error(error.message)
    throw new Error()
  }

  return { authUserId: data.user.id }
}

async function resendEmailConfirmation({ supabaseClient, email }: { supabaseClient: SupabaseClient; email: string }): Promise<void> {
  const { error } = await supabaseClient.auth.resend({
    type: 'signup',
    email,
  })

  if (error) {
    console.error('Failed to resend confirmation email:', error)
    throw new Error('Failed to resend confirmation email')
  }
}

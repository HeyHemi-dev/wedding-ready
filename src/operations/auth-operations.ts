import { SupabaseClient } from '@supabase/supabase-js'

import { UserSignupForm, UserSigninForm, UserForgotPasswordForm, UserResetPasswordForm, UserUpdateEmailForm } from '@/app/_types/validation-schema'
import * as t from '@/models/types'
import { userProfileModel } from '@/models/user'
import { handleSupabaseSignUpAuthResponse } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

export const authOperations = {
  signUp,
  signUpWithGoogle,
  getUserSignUpStatus,
  signIn,
  signOut,
  forgotPassword,
  resetPassword,
  updateEmail,
  resendEmailConfirmation,
  completeOnboarding,
}

async function signUp({
  userSignFormData,
  supabaseClient,
  origin,
}: {
  userSignFormData: UserSignupForm
  supabaseClient: SupabaseClient
  origin: string
}): Promise<{ authUserId: string }> {
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

  return { authUserId: user.id }
}

async function signUpWithGoogle({ supabaseClient, origin }: { supabaseClient: SupabaseClient; origin: string }) {
  await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })
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
    error,
  } = await supabaseClient.auth.getUser()

  if (error || !user) return null

  const authUserId = user.id
  const email = user.email || ''

  if (!user.email_confirmed_at) {
    return { status: SIGN_UP_STATUS.UNVERIFIED, authUserId, email }
  }

  const profile = await userProfileModel.getRawById(authUserId)
  if (!profile) {
    return { status: SIGN_UP_STATUS.VERIFIED, authUserId, email }
  }
  return { status: SIGN_UP_STATUS.ONBOARDED, authUserId }
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

async function completeOnboarding({ authUserId, handle, displayName }: { authUserId: string; handle: string; displayName: string }): Promise<t.UserProfileRaw> {
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

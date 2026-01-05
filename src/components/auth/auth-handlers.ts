import { SupabaseClient } from '@supabase/supabase-js'

import { OPERATION_ERROR } from '@/app/_types/errors'
import { UserForgotPasswordForm, UserResetPasswordForm, UserSigninForm, UserSignupForm } from '@/app/_types/validation-schema'
import { isProtectedPath } from '@/middleware-helpers'
import { getOrigin } from '@/utils/api-helpers'
import { PARAMS, SIGN_IN_METHODS } from '@/utils/constants'
import { emptyStringToNull } from '@/utils/empty-strings'
import { saveLastSignInMethod } from '@/utils/local-storage'
import { logger } from '@/utils/logger'

export async function handleSupabaseSignUpWithPassword(supabaseClient: SupabaseClient, data: UserSignupForm): Promise<{ id: string }> {
  // No need for zod validation, the schema is already validated by RHF
  const { data: authData, error } = await supabaseClient.auth.signUp({
    email: data.email,
    password: data.password,
  })

  if (error || !authData.user) {
    logger.error('auth.sign_up_failed', {
      code: error?.code,
      message: error?.message,
    })
    throw OPERATION_ERROR.DATABASE_ERROR('Failed to create user')
  }

  // Save last sign-in method (non-critical, fail silently)
  saveLastSignInMethod(SIGN_IN_METHODS.EMAIL)

  return { id: authData.user.id }
}

export async function handleSupabaseSignInWithPassword(supabaseClient: SupabaseClient, data: UserSigninForm): Promise<{ authUserId: string }> {
  // Validation required, the schema is very permissive as a security measure and allows empty strings
  const email = emptyStringToNull(data.email)
  const password = emptyStringToNull(data.password)
  if (!email || !password) {
    throw OPERATION_ERROR.VALIDATION_ERROR('Email and password are required')
  }

  const { data: authData, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  })
  if (error || !authData.user) {
    logger.error('auth.sign_in_failed', {
      code: error?.code,
      message: error?.message,
    })
    throw OPERATION_ERROR.INVALID_STATE('Failed to sign in')
  }

  // Save last sign-in method (non-critical, fail silently)
  saveLastSignInMethod(SIGN_IN_METHODS.EMAIL)

  return { authUserId: authData.user.id }
}

export async function handleSupabaseSignInWithGoogle(supabaseClient: SupabaseClient, next: string): Promise<void> {
  const origin = getOrigin()
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?${PARAMS.NEXT}=${encodeURIComponent(next)}`,
    },
  })

  if (error) {
    throw OPERATION_ERROR.INVALID_STATE(error.message)
  }

  // Save last sign-in method (non-critical, fail silently)
  saveLastSignInMethod(SIGN_IN_METHODS.GOOGLE)

  return
}

export async function handleSupabaseSignOut(supabaseClient: SupabaseClient, pathname: string): Promise<{ next: string }> {
  const { error } = await supabaseClient.auth.signOut()

  if (error) {
    throw OPERATION_ERROR.INVALID_STATE(error.message)
  }

  return { next: isProtectedPath(pathname) ? '/sign-in' : pathname }
}

export async function handleSupabaseForgotPassword(supabaseClient: SupabaseClient, data: UserForgotPasswordForm): Promise<void> {
  // No need for zod validation, the schema is already validated by RHF
  const { error } = await supabaseClient.auth.resetPasswordForEmail(data.email)

  if (error) {
    throw OPERATION_ERROR.INVALID_STATE(error.message)
  }

  return
}

export async function handleSupabaseUpdatePassword(supabaseClient: SupabaseClient, data: UserResetPasswordForm): Promise<void> {
  // Password === confirmPassword is validated by the schema
  // No need for zod validation, the schema is already validated by RHF
  const { error } = await supabaseClient.auth.updateUser({
    password: data.password,
  })

  if (error) {
    logger.error('auth.update_password_failed', {
      code: error.code,
      message: error.message,
    })
    throw OPERATION_ERROR.DATABASE_ERROR('Failed to update password')
  }

  return
}

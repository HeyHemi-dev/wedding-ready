import { SupabaseClient } from '@supabase/supabase-js'

import { OPERATION_ERROR } from '@/app/_types/errors'
import { UserSigninForm , UserSignupForm, userSignupFormSchema } from '@/app/_types/validation-schema'
import { isProtectedPath } from '@/middleware-helpers'
import { getOrigin } from '@/utils/api-helpers'
import { PARAMS } from '@/utils/constants'
import { emptyStringToNull } from '@/utils/empty-strings'

export async function handleSupabaseSignUpWithPassword(supabaseClient: SupabaseClient, data: UserSignupForm) {
  const { success, data: validatedData } = userSignupFormSchema.safeParse(data)
  if (!success) {
    throw OPERATION_ERROR.VALIDATION_ERROR('Invalid email or password')
  }

  const { error } = await supabaseClient.auth.signUp({
    email: validatedData.email,
    password: validatedData.password,
  })

  if (error) {
    throw OPERATION_ERROR.DATABASE_ERROR(error.message)
  }

  return
}

export async function handleSupabaseSignInWithPassword(supabaseClient: SupabaseClient, data: UserSigninForm): Promise<void> {
  const email = emptyStringToNull(data.email)
  const password = emptyStringToNull(data.password)

  if (!email || !password) {
    throw OPERATION_ERROR.VALIDATION_ERROR('Email and password are required')
  }

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw OPERATION_ERROR.INVALID_STATE(error.message)
  }

  return
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

  return
}

export async function handleSupabaseSignOut(supabaseClient: SupabaseClient, pathname: string): Promise<{ next: string }> {
  const { error } = await supabaseClient.auth.signOut()

  if (error) {
    throw OPERATION_ERROR.INVALID_STATE(error.message)
  }

  return { next: isProtectedPath(pathname) ? '/sign-in' : pathname }
}

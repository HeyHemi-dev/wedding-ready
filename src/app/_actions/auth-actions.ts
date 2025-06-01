import { SupabaseClient } from '@supabase/supabase-js'

import { AuthUser, User } from '@/models/types'
import { UserDetailModel } from '@/models/user'
import { handleSupabaseSignUpAuthResponse } from '@/utils/auth'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'

import { UserSignupForm, UserSigninForm, ForgotPasswordForm } from '@/app/_types/validation-schema'

export const authActions = {
  signUp,
  signIn,
  signOut,
  forgotPassword,
  resetPassword,
}

async function signUp({
  userSignFormData,
  supabaseClient,
  origin,
}: {
  userSignFormData: UserSignupForm
  supabaseClient: SupabaseClient
  origin: string
}): Promise<User> {
  const { email, password, handle, displayName } = userSignFormData

  const isAvailable = await UserDetailModel.isHandleAvailable({ handle })
  if (!isAvailable) {
    throw new Error('Handle is already taken')
  }

  // Create supabase user for auth
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

  // Create userDetail record for app data
  const { data: userDetails, error: dbError } = await tryCatch(
    UserDetailModel.create({
      id: user.id,
      handle,
      displayName,
    })
  )

  if (dbError) {
    const supabaseAdmin = createAdminClient()
    console.error('Failed to create user details:', dbError)
    await supabaseAdmin.auth.admin.deleteUser(user.id)
    throw new Error('Failed to create account')
  }

  return userDetails
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

async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error(error.message)
    throw new Error()
  }
}

async function forgotPassword({
  forgotPasswordFormData,
  supabaseClient,
  origin,
}: {
  forgotPasswordFormData: ForgotPasswordForm
  supabaseClient: SupabaseClient
  origin: string
}) {
  const { error } = await supabaseClient.auth.resetPasswordForEmail(forgotPasswordFormData.email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/account/reset-password`,
  })

  if (error) {
    console.error(error.message)
    throw new Error()
  }
}

async function resetPassword({ password }: { password: string }): Promise<AuthUser> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    console.error(error.message)
    throw new Error()
  }
  return data.user
}

import { AuthUser, User } from '@/models/types'
import { UserDetailModel } from '@/models/user'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'
import { headers } from 'next/headers'
import { AuthResponse } from '@supabase/supabase-js'
import { handleSupabaseSignUpAuthResponse } from '@/utils/auth'

export const authActions = {
  signUp,
  signIn,
  signOut,
  forgotPassword,
  resetPassword,
}

async function signUp({ email, password, handle, displayName }: { email: string; password: string; handle: string; displayName: string }): Promise<User> {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()
  const origin = (await headers()).get('origin')

  const { data: authResponse, error: signUpError } = await tryCatch(
    supabase.auth.signUp({
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

  // Create userDetail record
  const { data: userDetails, error: dbError } = await tryCatch(
    UserDetailModel.create({
      id: user.id,
      handle,
      displayName,
    })
  )

  if (dbError) {
    console.error('Failed to create user details:', dbError)
    await supabaseAdmin.auth.admin.deleteUser(user.id)
    throw new Error('Failed to create account')
  }

  return userDetails
}

async function signIn({ email, password }: { email: string; password: string }): Promise<AuthUser> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error(error.message)
    throw new Error()
  }

  return data.user
}

async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error(error.message)
    throw new Error()
  }
}

async function forgotPassword({ email, origin }: { email: string; origin: string | null }) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
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

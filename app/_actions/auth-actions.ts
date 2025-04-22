import { AuthUser, User } from '@/models/types'
import { UserDetailModel } from '@/models/user'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'

export const authActions = {
  signUp,
  signIn,
  signOut,
  forgotPassword,
  resetPassword,
}

async function signUp({
  email,
  password,
  handle,
  displayName,
  origin,
}: {
  email: string
  password: string
  handle: string
  displayName: string
  origin: string | null
}): Promise<User> {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error || !data.user) {
    console.error(error?.message || 'no auth user')
    throw new Error()
  }

  // Create userDetail record if auth signup succeeded
  const { data: user, error: dbError } = await tryCatch(UserDetailModel.create({ id: data.user.id, handle, displayName }))

  if (dbError) {
    console.error('Failed to create user details:', dbError)
    await supabaseAdmin.auth.admin.deleteUser(data.user.id)
    throw new Error()
  }

  return user
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

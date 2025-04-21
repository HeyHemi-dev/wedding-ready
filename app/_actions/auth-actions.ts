import { UserDetailModel } from '@/models/user'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'
import { UserDetailRaw } from '@/models/types'

export const authActions = {
  signUp,
  signOut,
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
}): Promise<UserDetailRaw> {
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

async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error(error.message)
    throw new Error()
  }
}

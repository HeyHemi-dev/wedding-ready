'use server'

import { authOperations } from '@/operations/auth-operations'
import { tags } from '@/app/_types/tags'
import { encodedRedirect } from '@/utils/encoded-redirect'
import { createClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signInFormAction(formData: FormData) {
  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()
  const redirectTo = formData.get('redirectTo')?.toString() || '/feed'

  if (!email || !password) {
    return encodedRedirect('error', '/sign-in', 'Email and password are required')
  }

  const supabase = await createClient()
  const { data, error } = await tryCatch(authOperations.signIn({ userSigninFormData: { email, password }, supabaseClient: supabase }))

  if (error) {
    return encodedRedirect('error', '/sign-in', 'Invalid email or password')
  }

  // Revalidate the user cache on successful sign in
  revalidateTag(tags.currentUser(data.authUserId))

  return redirect(redirectTo)
}

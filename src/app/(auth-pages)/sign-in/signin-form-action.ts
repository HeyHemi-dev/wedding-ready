'use server'

import { authActions } from '@/app/_actions/auth-actions'
import { tags } from '@/app/_types/tags'
import { encodedRedirect } from '@/utils/encoded-redirect'
import { createClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signInFormAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo')?.toString() || '/feed'

  const supabase = await createClient()
  const { data, error } = await tryCatch(authActions.signIn({ userSigninFormData: { email, password }, supabaseClient: supabase }))

  if (error) {
    return encodedRedirect('error', '/sign-in', error.message)
  }

  // Revalidate the user cache on successful sign in
  revalidateTag(tags.currentUser(data.authUserId))

  return redirect(redirectTo)
}

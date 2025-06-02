'use server'

import { revalidateTag } from 'next/cache'
import { headers } from 'next/headers'

import { authOperations } from '@/app/_actions/auth-operations'
import { isProtectedPath } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'
import { tags } from '@/app/_types/tags'
import { createClient } from '@/utils/supabase/server'

export async function SignOutFormAction({ pathname }: { pathname: string }): Promise<{ redirectTo: string }> {
  const headersList = await headers()
  const userId = headersList.get('x-auth-user-id')

  const supabase = await createClient()
  const { error } = await tryCatch(authOperations.signOut({ supabaseClient: supabase }))

  if (error) {
    throw new Error('Failed to sign out')
  }

  if (userId) {
    revalidateTag(tags.currentUser(userId))
  }

  // Safe even if pathname is manipulated client-side.
  // Because we always redirect; isProtectedPath ensures the redirect is either sign-in or a safe pathname
  return { redirectTo: isProtectedPath(pathname) ? '/sign-in' : pathname }
}

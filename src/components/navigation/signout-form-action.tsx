'use server'

import { isProtectedPath } from '@/middleware-helpers'
import { authOperations } from '@/operations/auth-operations'
import { createClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'

export async function SignOutFormAction({ next }: { next: string }): Promise<{ redirectTo: string }> {
  const supabase = await createClient()
  const { error } = await tryCatch(authOperations.signOut({ supabaseClient: supabase }))

  if (error) {
    throw new Error('Failed to sign out')
  }

  // Safe even if next is manipulated client-side.
  // Because we always redirect; isProtectedPath ensures the redirect is either sign-in or a safe next
  return { redirectTo: isProtectedPath(next) ? '/sign-in' : next }
}

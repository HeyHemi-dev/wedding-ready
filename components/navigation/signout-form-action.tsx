'use server'

import { revalidateTag } from 'next/cache'
import { headers } from 'next/headers'

import { authActions } from '@/src/app/_actions/auth-actions'
import { isProtectedPath } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

export async function SignOutFormAction({ pathname }: { pathname: string }): Promise<{ redirectTo: string }> {
  const headersList = await headers()
  const userId = headersList.get('x-auth-user-id')

  const { error } = await tryCatch(authActions.signOut())

  if (error) {
    throw new Error('Failed to sign out')
  }

  if (userId) {
    revalidateTag(`user-${userId}`)
  }

  // Safe even if pathname is manipulated client-side.
  // Because we always redirect; isProtectedPath ensures the redirect is either sign-in or a safe pathname
  return { redirectTo: isProtectedPath(pathname) ? '/sign-in' : pathname }
}

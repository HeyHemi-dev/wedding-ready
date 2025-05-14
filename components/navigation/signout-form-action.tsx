'use server'

import { revalidateTag } from 'next/cache'
import { headers } from 'next/headers'

import { authActions } from '@/app/_actions/auth-actions'
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

  return { redirectTo: isProtectedPath(pathname) ? '/sign-in' : pathname }
}

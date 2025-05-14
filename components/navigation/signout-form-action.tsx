'use server'

import { revalidateTag } from 'next/cache'
import { headers } from 'next/headers'

import { authActions } from '@/app/_actions/auth-actions'

import { isProtectedPath } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

export async function SignOutFormAction({ pathname }: { pathname: string }): Promise<{ redirectTo: string }> {
  const headersList = await headers()
  const userId = headersList.get('x-auth-user-id')
  const referer = headersList.get('referer') || '/'
  const url = new URL(referer)

  const { error } = await tryCatch(authActions.signOut())

  if (error) {
    throw new Error('Failed to sign out')
  }

  if (userId) {
    revalidateTag(`user-${userId}`)
  }

  const redirectTo = isProtectedPath(url.pathname) ? '/sign-in' : referer
  console.log({ referer, redirectTo })

  return { redirectTo }
}

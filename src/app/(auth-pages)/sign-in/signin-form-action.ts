'use server'

import { authActions } from '@/app/_actions/auth-actions'
import { encodedRedirect } from '@/utils/encoded-redirect'
import { tryCatch } from '@/utils/try-catch'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signInFormAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo')?.toString() || '/feed'

  console.log({ email, password, redirectTo })

  const { data: authUser, error } = await tryCatch(authActions.signIn({ email, password }))

  if (error) {
    return encodedRedirect('error', '/sign-in', error.message)
  }

  // Revalidate the user cache on successful sign in
  if (authUser) {
    revalidateTag(`user-${authUser.id}`)
  }

  return redirect(redirectTo)
}

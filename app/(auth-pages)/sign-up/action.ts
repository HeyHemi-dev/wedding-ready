'use server'

import { authActions } from '@/app/_actions/auth-actions'
import { userSignupFormSchema } from '@/app/_types/validation-schema'

import { encodedRedirect } from '@/utils/encoded-redirect'
import { tryCatch } from '@/utils/try-catch'
import { headers } from 'next/headers'
import { revalidateTag } from 'next/cache'

export async function signUpFormAction(formData: FormData) {
  'use server'
  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()
  const handle = formData.get('handle')?.toString()
  const displayName = formData.get('displayName')?.toString()
  const origin = (await headers()).get('origin')

  if (!email || !password || !handle || !displayName) {
    return encodedRedirect('error', '/sign-up', 'Email, password, name and handle are required')
  }

  // Validate form data using Zod schema
  const validationResult = userSignupFormSchema.safeParse({
    email,
    password,
    handle,
    displayName,
  })

  if (!validationResult.success) {
    // Get the first error message
    const errorMessage = validationResult.error.errors[0]?.message || 'Invalid form data'
    return encodedRedirect('error', '/sign-up', errorMessage)
  }

  const { data: user, error } = await tryCatch(authActions.signUp({ email, password, handle, displayName, origin }))

  if (error) {
    return encodedRedirect('error', '/sign-up', 'Failed to sign up')
  }

  // Revalidate the user cache for the new user
  revalidateTag(`user-${user.id}`)

  return encodedRedirect('success', '/sign-up', 'Thanks for signing up! Please check your email for a verification link.')
}

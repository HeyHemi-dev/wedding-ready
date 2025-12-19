'use server'

import { redirect } from 'next/navigation'

import { authOperations, SIGN_UP_STATUS } from '@/operations/auth-operations'
import { PARAMS } from '@/utils/constants'
import { encodedRedirect } from '@/utils/encoded-redirect'
import { createClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'

export async function signInFormAction(formData: FormData) {
  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()
  const redirectTo = formData.get('redirectTo')?.toString() || '/feed'

  if (!email || !password) {
    return encodedRedirect(PARAMS.ERROR, '/sign-in', 'Email and password are required')
  }

  const supabase = await createClient()
  const { error } = await tryCatch(authOperations.signIn({ userSigninFormData: { email, password }, supabaseClient: supabase }))

  if (error) {
    return encodedRedirect(PARAMS.ERROR, '/sign-in', 'Invalid email or password')
  }

  const signUpStatus = await authOperations.getUserSignUpStatus(supabase)
  if (signUpStatus?.status === SIGN_UP_STATUS.UNVERIFIED) {
    return redirect('/check-inbox')
  }

  if (signUpStatus?.status === SIGN_UP_STATUS.VERIFIED) {
    return redirect(`/onboarding?${PARAMS.NEXT}=${encodeURIComponent(redirectTo)}`)
  }

  return redirect(redirectTo)
}

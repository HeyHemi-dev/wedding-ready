'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { authOperations } from '@/operations/auth-operations'
import { PARAMS } from '@/utils/constants'
import { encodedRedirect } from '@/utils/encoded-redirect'
import { createClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'

export async function forgotPasswordFormAction(formData: FormData) {
  const email = formData.get('email')?.toString()
  const callbackUrl = formData.get('callbackUrl')?.toString()

  if (!email) {
    return encodedRedirect(PARAMS.ERROR, '/forgot-password', 'Email is required')
  }

  const origin = (await headers()).get('origin')
  const supabase = await createClient()
  if (!origin || !supabase) {
    return encodedRedirect(PARAMS.ERROR, '/forgot-password', 'Could not reset password')
  }
  const { error } = await tryCatch(authOperations.forgotPassword({ forgotPasswordFormData: { email }, supabaseClient: supabase, origin }))

  if (error) {
    return encodedRedirect(PARAMS.ERROR, '/forgot-password', 'Could not reset password')
  }

  if (callbackUrl) {
    return redirect(callbackUrl)
  }

  return encodedRedirect(PARAMS.SUCCESS, '/forgot-password', 'Check your email for a link to reset your password.')
}

'use server'

import { authActions } from '@/app/_actions/auth-actions'

import { encodedRedirect } from '@/utils/encoded-redirect'
import { createClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function forgotPasswordFormAction(formData: FormData) {
  const email = formData.get('email')?.toString()
  const callbackUrl = formData.get('callbackUrl')?.toString()

  if (!email) {
    return encodedRedirect('error', '/forgot-password', 'Email is required')
  }

  const origin = (await headers()).get('origin')
  const supabase = await createClient()
  if (!origin || !supabase) {
    return encodedRedirect('error', '/forgot-password', 'Could not reset password')
  }
  const { error } = await tryCatch(authActions.forgotPassword({ forgotPasswordFormData: { email }, supabaseClient: supabase, origin }))

  if (error) {
    return encodedRedirect('error', '/forgot-password', 'Could not reset password')
  }

  if (callbackUrl) {
    return redirect(callbackUrl)
  }

  return encodedRedirect('success', '/forgot-password', 'Check your email for a link to reset your password.')
}

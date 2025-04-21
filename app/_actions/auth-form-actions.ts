'use server'

import { revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { encodedRedirect } from '@/utils/encoded-redirect'

import { authActions } from './auth-actions'
import { tryCatch } from '@/utils/try-catch'

export const signInAction = async (formData: FormData) => {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo')?.toString() || '/feed'

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

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get('email')?.toString()
  const origin = (await headers()).get('origin')
  const callbackUrl = formData.get('callbackUrl')?.toString()

  if (!email) {
    return encodedRedirect('error', '/forgot-password', 'Email is required')
  }

  const { error } = await tryCatch(authActions.forgotPassword({ email, origin }))

  if (error) {
    return encodedRedirect('error', '/forgot-password', 'Could not reset password')
  }

  if (callbackUrl) {
    return redirect(callbackUrl)
  }

  return encodedRedirect('success', '/forgot-password', 'Check your email for a link to reset your password.')
}

export const resetPasswordAction = async (formData: FormData) => {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    encodedRedirect('error', '/account/reset-password', 'Password and confirm password are required')
  }

  if (password !== confirmPassword) {
    encodedRedirect('error', '/account/reset-password', 'Passwords do not match')
  }

  const { data: authUser, error } = await tryCatch(authActions.resetPassword({ password, confirmPassword }))

  if (error) {
    encodedRedirect('error', '/account/reset-password', 'Password update failed')
  }

  // Revalidate the user cache after password update
  if (authUser) {
    revalidateTag(`user-${authUser.id}`)
  }

  encodedRedirect('success', '/account/reset-password', 'Password updated')
}

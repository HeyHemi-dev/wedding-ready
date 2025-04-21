'use server'

import { revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'

import { isProtectedPath } from '@/utils/auth'
import { encodedRedirect } from '@/utils/encoded-redirect'
import { createClient } from '@/utils/supabase/server'

export const signInAction = async (formData: FormData) => {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo')?.toString() || '/feed'
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return encodedRedirect('error', '/sign-in', error.message)
  }

  // Revalidate the user cache on successful sign in
  if (data.user) {
    revalidateTag(`user-${data.user.id}`)
  }

  return redirect(redirectTo)
}

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get('email')?.toString()
  const supabase = await createClient()
  const origin = (await headers()).get('origin')
  const callbackUrl = formData.get('callbackUrl')?.toString()

  if (!email) {
    return encodedRedirect('error', '/forgot-password', 'Email is required')
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/account/reset-password`,
  })

  if (error) {
    console.error(error.message)
    return encodedRedirect('error', '/forgot-password', 'Could not reset password')
  }

  if (callbackUrl) {
    return redirect(callbackUrl)
  }

  return encodedRedirect('success', '/forgot-password', 'Check your email for a link to reset your password.')
}

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    encodedRedirect('error', '/account/reset-password', 'Password and confirm password are required')
  }

  if (password !== confirmPassword) {
    encodedRedirect('error', '/account/reset-password', 'Passwords do not match')
  }

  const { data, error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    encodedRedirect('error', '/account/reset-password', 'Password update failed')
  }

  // Revalidate the user cache after password update
  if (data.user) {
    revalidateTag(`user-${data.user.id}`)
  }

  encodedRedirect('success', '/account/reset-password', 'Password updated')
}

export const signOutAction = async () => {
  const supabase = await createClient()
  const headersList = await headers()
  const userId = headersList.get('x-auth-user-id')
  const referer = headersList.get('referer') || '/'
  const url = new URL(referer)

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error(error.message)
    toast.error('Failed to sign out')
    return
  }

  if (userId) {
    revalidateTag(`user-${userId}`)
  }

  const redirectTo = isProtectedPath(url.pathname) ? '/sign-in' : referer
  return redirect(redirectTo)
}

'use server'

import { encodedRedirect } from '@/utils/utils'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import UserDetailActions from '@/actions/user-actions'
import { isProtectedPath } from '@/utils/auth'

export const signUpAction = async (formData: FormData) => {
  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()
  const handle = formData.get('handle')?.toString()
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()
  const origin = (await headers()).get('origin')

  if (!email || !password || !handle) {
    return encodedRedirect('error', '/sign-up', 'Email, password and handle are required')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error(error.code + ' ' + error.message)
    return encodedRedirect('error', '/sign-up', error.message)
  }

  // Create userDetail record if auth signup succeeded
  if (data.user) {
    try {
      await UserDetailActions.create({ id: data.user.id, handle })
    } catch (error) {
      console.error('Failed to create user details:', error)
      // Delete the auth user since we couldn't create their profile
      await supabaseAdmin.auth.admin.deleteUser(data.user.id)
      return encodedRedirect('error', '/sign-up', 'Failed to complete signup. Please try again.')
    }
  }

  return encodedRedirect('success', '/sign-up', 'Thanks for signing up! Please check your email for a verification link.')
}

export const signInAction = async (formData: FormData) => {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo')?.toString() || '/feed'
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return encodedRedirect('error', '/sign-in', error.message)
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

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    encodedRedirect('error', '/account/reset-password', 'Password update failed')
  }

  encodedRedirect('success', '/account/reset-password', 'Password updated')
}

export const signOutAction = async () => {
  const supabase = await createClient()
  const headersList = await headers()
  const referer = headersList.get('referer') || '/'
  const url = new URL(referer)

  await supabase.auth.signOut()

  // If on a protected page, redirect to sign-in, otherwise stay on current page
  return isProtectedPath(url.pathname) ? redirect('/sign-in') : redirect(referer)
}

'use server'

import { cookies } from 'next/headers'

import { authOperations } from '@/operations/auth-operations'
import { createClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'
import { RESEND_EMAIL_COOLDOWN_SECONDS, RESEND_EMAIL_COOLDOWN_ENDS_AT_STORAGE_KEY } from '@/utils/constants'

export type ResendEmailResult = { ok: true; cooldownEndsAtMs: number } | { ok: false; cooldownEndsAtMs: number } // rate-limited

export async function resendFormAction(): Promise<ResendEmailResult> {
  const cookieStore = await cookies()
  const lastResendCookie = cookieStore.get(RESEND_EMAIL_COOLDOWN_ENDS_AT_STORAGE_KEY)

  if (lastResendCookie) {
    const lastResendTime = parseInt(lastResendCookie.value, 10)
    const now = Date.now()
    const elapsed = Math.floor((now - lastResendTime) / 1000)
    const remaining = RESEND_EMAIL_COOLDOWN_SECONDS - elapsed

    if (remaining > 0) {
      return { ok: false, cooldownEndsAtMs: lastResendTime + remaining * 1000 }
    }
  }

  // Get user email from auth
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    throw new Error('User not found')
  }

  // Resend email
  const { error } = await tryCatch(
    authOperations.resendEmailConfirmation({
      supabaseClient: supabase,
      email: user.email,
    })
  )

  if (error) {
    console.error('Failed to resend email:', error)
    throw new Error('Failed to resend email')
  }

  // Set cooldown cookie

  const cooldownEndsAtMs = Date.now() + RESEND_EMAIL_COOLDOWN_SECONDS * 1000
  cookieStore.set(RESEND_EMAIL_COOLDOWN_ENDS_AT_STORAGE_KEY, cooldownEndsAtMs.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: RESEND_EMAIL_COOLDOWN_SECONDS,
  })

  return { ok: true, cooldownEndsAtMs }
}

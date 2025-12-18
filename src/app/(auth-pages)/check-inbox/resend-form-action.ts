'use server'

import { cookies } from 'next/headers'

import { authOperations } from '@/operations/auth-operations'
import { createClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'
import { RESEND_EMAIL_COOLDOWN_SECONDS, RESEND_EMAIL_COOLDOWN_ENDS_AT_STORAGE_KEY } from '@/utils/constants'
import { OPERATION_ERROR } from '@/app/_types/errors'

export type ResendEmailResult = { ok: true; cooldownEndsAtMs: number } | { ok: false; cooldownEndsAtMs: number } // rate-limited

export async function resendFormAction(): Promise<ResendEmailResult> {
  const nowMs = Date.now()
  const cookieStore = await cookies()
  const cooldownEndsAtMs = getCooldownEndsAtFromCookie(cookieStore, nowMs)

  if (cooldownEndsAtMs && cooldownEndsAtMs > nowMs) {
    return { ok: false, cooldownEndsAtMs }
  }

  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user?.email) throw OPERATION_ERROR.INVALID_STATE('User not found')

  const { error } = await tryCatch(
    authOperations.resendEmailConfirmation({
      supabaseClient: supabase,
      email: data.user.email,
    })
  )

  if (error) {
    console.error('Failed to resend email:', error)
    throw OPERATION_ERROR.DATABASE_ERROR('Failed to resend email')
  }

  const nextCooldownEndsAtMs = nowMs + RESEND_EMAIL_COOLDOWN_SECONDS * 1000
  cookieStore.set(RESEND_EMAIL_COOLDOWN_ENDS_AT_STORAGE_KEY, String(nextCooldownEndsAtMs), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: RESEND_EMAIL_COOLDOWN_SECONDS,
    path: '/',
  })

  return { ok: true, cooldownEndsAtMs: nextCooldownEndsAtMs }
}

function getCooldownEndsAtFromCookie(cookieStore: Awaited<ReturnType<typeof cookies>>, nowMs: number) {
  const cookieValue = cookieStore.get(RESEND_EMAIL_COOLDOWN_ENDS_AT_STORAGE_KEY)?.value
  if (!cookieValue) return null
  const parsed = Number(cookieValue)
  if (!Number.isFinite(parsed)) return null
  // If clock moved backwards, ensure we don’t extend beyond the standard window
  const maxEndsAtMs = nowMs + RESEND_EMAIL_COOLDOWN_SECONDS * 1000
  return Math.min(parsed, maxEndsAtMs)
}

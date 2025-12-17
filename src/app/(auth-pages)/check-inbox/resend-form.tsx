'use client'

import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { tryCatch } from '@/utils/try-catch'

import { resendFormAction } from './resend-form-action'
import { isClient } from '@/utils/api-helpers'

const COOLDOWN_STORAGE_KEY = 'resend-email-cooldown-ends-at-ms'
const FALLBACK_COOLDOWN_SECONDS = 60

function clampToSecondsLeft(endsAtMilliSeconds: number | null) {
  if (!endsAtMilliSeconds) return 0
  const diff = endsAtMilliSeconds - Date.now()
  return Math.max(0, Math.ceil(diff / 1000))
}

export function ResendForm() {
  const [endsAtMilliSeconds, setEndsAtMilliSeconds] = useState<number | null>(() => {
    if (!isClient()) return null

    const raw = window.localStorage.getItem(COOLDOWN_STORAGE_KEY)
    const parsed = raw ? Number(raw) : NaN
    return Number.isFinite(parsed) ? parsed : null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const secondsLeft = useMemo(() => clampToSecondsLeft(endsAtMilliSeconds), [endsAtMilliSeconds])

  useEffect(() => {
    if (secondsLeft === 0) return

    const id = window.setInterval(() => {
      // triggers a re-render so secondsLeft re-computes from Date.now()
      setEndsAtMilliSeconds((v) => v)
    }, 1000)

    return () => window.clearInterval(id)
  }, [secondsLeft])

  // Clean up storage when cooldown ends
  useEffect(() => {
    if (secondsLeft !== 0) return
    window.localStorage.removeItem(COOLDOWN_STORAGE_KEY)
    setEndsAtMilliSeconds((prev) => (prev && prev <= Date.now() ? null : prev))
  }, [secondsLeft])

  function startCooldown(seconds: number) {
    const nextEndsAt = Date.now() + seconds * 1000
    setEndsAtMilliSeconds(nextEndsAt)
    window.localStorage.setItem(COOLDOWN_STORAGE_KEY, String(nextEndsAt))
  }

  async function handleResend() {
    if (isSubmitting || secondsLeft > 0) return

    setIsSubmitting(true)
    const { data, error } = await tryCatch(resendFormAction())

    if (error) {
      toast.error(error.message || 'Failed to resend email')
      setIsSubmitting(false)
      return
    }

    if (data?.cooldownRemaining) {
      startCooldown(data.cooldownRemaining)
      toast.info(`Please wait ${data.cooldownRemaining}s before resending`)
    } else if (data?.success) {
      toast.success('Confirmation email sent! Please check your inbox.')
      startCooldown(FALLBACK_COOLDOWN_SECONDS)
    } else {
      toast.message('Done.')
    }

    setIsSubmitting(false)
  }

  return (
    <Button onClick={handleResend} disabled={isSubmitting || secondsLeft > 0}>
      {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend email'}
    </Button>
  )
}

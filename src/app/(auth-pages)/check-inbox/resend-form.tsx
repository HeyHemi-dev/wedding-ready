'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { tryCatch } from '@/utils/try-catch'
import { resendFormAction } from './resend-form-action'

import { RESEND_EMAIL_COOLDOWN_ENDS_AT_STORAGE_KEY } from '@/utils/constants'

function getSecondsRemaining(cooldownEndsAtMs: number | null) {
  if (!cooldownEndsAtMs) return 0
  const msRemaining = cooldownEndsAtMs - Date.now()
  return Math.max(0, Math.ceil(msRemaining / 1000))
}

export function ResendForm() {
  const [cooldownEndsAtMs, setCooldownEndsAtMs, removeCooldownEndsAtMs] = useLocalStorage<number | null>(RESEND_EMAIL_COOLDOWN_ENDS_AT_STORAGE_KEY, null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const secondsRemaining = useMemo(() => getSecondsRemaining(cooldownEndsAtMs), [cooldownEndsAtMs])

  useEffect(() => {
    if (secondsRemaining === 0) return
    const id = window.setInterval(() => {
      // forces a re-render so secondsRemaining recomputes from Date.now()
      setCooldownEndsAtMs((v) => v)
    }, 1000)
    return () => window.clearInterval(id)
  }, [secondsRemaining, setCooldownEndsAtMs])

  useEffect(() => {
    if (secondsRemaining !== 0) return
    // cleanup persisted value once the cooldown has definitely expired
    if (cooldownEndsAtMs !== null && cooldownEndsAtMs <= Date.now()) {
      removeCooldownEndsAtMs()
    }
  }, [secondsRemaining, cooldownEndsAtMs, removeCooldownEndsAtMs])

  function startCooldown(cooldownEndsAtMs: number) {
    setCooldownEndsAtMs(cooldownEndsAtMs)
  }

  async function handleResend() {
    if (isSubmitting || secondsRemaining > 0) return
    setIsSubmitting(true)
    const { data, error } = await tryCatch(resendFormAction())

    if (error) {
      toast.error(error.message || 'Failed to resend email')
      setIsSubmitting(false)
      return
    }

    if (data.ok === false) {
      setCooldownEndsAtMs(data.cooldownEndsAtMs)
      toast.info(`Please wait ${getSecondsRemaining(data.cooldownEndsAtMs)}s before resending`)
    } else if (data.ok) {
      toast.success('Confirmation email sent! Please check your inbox.')
      setCooldownEndsAtMs(data.cooldownEndsAtMs)
    }
    setIsSubmitting(false)
  }

  return (
    <Button onClick={handleResend} disabled={isSubmitting || secondsRemaining > 0}>
      {secondsRemaining > 0 ? `Resend in ${secondsRemaining}s` : 'Resend email'}
    </Button>
  )
}

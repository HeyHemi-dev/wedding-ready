import { redirect } from 'next/navigation'

import { MESSAGE_CODES } from '@/components/auth/auth-message'
import { authOperations, SIGN_UP_STATUS } from '@/operations/auth-operations'
import { buildUrlWithSearchParams } from '@/utils/api-helpers'
import { PARAMS } from '@/utils/constants'
import { createClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'

import OnboardingForm from './onboarding-form'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data, error } = await tryCatch(authOperations.getUserSignUpStatus(supabase))
  if (error)
    redirect(
      buildUrlWithSearchParams('/sign-in', {
        [PARAMS.MESSAGE_TYPE]: 'error',
        [PARAMS.AUTH_MESSAGE_CODE]: MESSAGE_CODES.AUTH_FAILED,
        [PARAMS.NEXT]: '/onboarding',
      })
    )
  if (!data) redirect('/sign-in')

  // Check email verification
  if (data.status === SIGN_UP_STATUS.UNVERIFIED) redirect('/check-inbox')

  // Check if profile already exists
  if (data.status === SIGN_UP_STATUS.ONBOARDED) redirect('/feed')

  return (
    <>
      <div className="grid gap-spouse">
        <h1 className="heading-md">Complete your profile</h1>
        <p className="ui-small">Just a few more details to get started.</p>
      </div>
      <OnboardingForm />
    </>
  )
}

import { redirect } from 'next/navigation'

import { userProfileModel } from '@/models/user'
import { getAuthUserId } from '@/utils/auth'
import { createClient } from '@/utils/supabase/server'

import OnboardingForm from './onboarding-form'
import { authOperations, SIGN_UP_STATUS } from '@/operations/auth-operations'
import { tryCatch } from '@/utils/try-catch'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data, error } = await tryCatch(authOperations.getUserSignUpStatus(supabase))

  if (error || !data) {
    redirect('/sign-in')
  }

  // Check email verification
  if (data.status === SIGN_UP_STATUS.UNVERIFIED) {
    redirect('/check-inbox')
  }

  // Check if profile already exists
  if (data.status === SIGN_UP_STATUS.ONBOARDED) {
    redirect('/feed')
  }

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

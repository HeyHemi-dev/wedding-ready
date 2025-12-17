import { redirect } from 'next/navigation'

import { userProfileModel } from '@/models/user'
import { getAuthUserId } from '@/utils/auth'
import { createClient } from '@/utils/supabase/server'

import { ResendForm } from './resend-form'
import { userOperations } from '@/operations/user-operations'
import { tryCatch } from '@/utils/try-catch'
import { authOperations, SIGN_UP_STATUS } from '@/operations/auth-operations'

export default async function CheckInboxPage() {
  const supabase = await createClient()

  const signUpStatus = await authOperations.getUserSignUpStatus(supabase)
  if (!signUpStatus) {
    redirect('/sign-in')
  }

  if (signUpStatus.status === SIGN_UP_STATUS.UNVERIFIED) {
    return (
      <>
        <div className="grid gap-spouse text-center">
          <h1 className="heading-md">Check your inbox</h1>
          <p className="ui-small">
            We&apos;ve sent a confirmation email to <strong>{signUpStatus.email}</strong>. Please click the link in the email to verify your account.
          </p>
        </div>
        <div className="flex flex-col gap-sibling">
          <ResendForm />
        </div>
      </>
    )
  }

  if (signUpStatus.status === SIGN_UP_STATUS.ONBOARDED) {
    redirect('/feed')
  } else {
    redirect('/onboarding?next=/feed')
  }
}

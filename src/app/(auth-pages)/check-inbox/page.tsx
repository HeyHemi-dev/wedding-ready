import { redirect } from 'next/navigation'

import { authOperations, SIGN_UP_STATUS } from '@/operations/auth-operations'
import { PARAMS } from '@/utils/constants'
import { encodedRedirect } from '@/utils/encoded-redirect'
import { createClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'

import { ResendForm } from './resend-form'

export default async function CheckInboxPage() {
  const supabase = await createClient()
  const { data, error } = await tryCatch(authOperations.getUserSignUpStatus(supabase))
  if (error) encodedRedirect('error', '/sign-in', error.message)
  if (!data) redirect('/sign-in')

  if (data.status === SIGN_UP_STATUS.UNVERIFIED) {
    return (
      <>
        <div className="grid gap-spouse text-center">
          <h1 className="heading-md">Check your inbox</h1>
          <p className="ui-small">
            We&apos;ve sent a confirmation email to <strong>{data.email}</strong>. Please click the link in the email to verify your account.
          </p>
        </div>
        <div className="flex flex-col gap-sibling">
          <ResendForm />
        </div>
      </>
    )
  }

  if (data.status === SIGN_UP_STATUS.ONBOARDED) {
    redirect('/feed')
  } else {
    redirect(`/onboarding?${PARAMS.NEXT}=/feed`)
  }
}

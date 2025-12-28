import { redirect } from 'next/navigation'

import { MESSAGE_CODES } from '@/components/auth/auth-message'
import { authOperations, SIGN_UP_STATUS } from '@/operations/auth-operations'
import { buildUrlWithSearchParams, getNextUrl } from '@/utils/api-helpers'
import { PARAMS } from '@/utils/constants'
import { createClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'

import OnboardingForm from './onboarding-form'
import { SearchParams } from '@/app/_types/generics'

export default async function OnboardingPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams
  const next = await getNextUrl(searchParams)
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
  if (data.status === SIGN_UP_STATUS.UNVERIFIED) redirect('/sign-up/check-inbox')

  // Check if profile already exists
  if (data.status === SIGN_UP_STATUS.ONBOARDED) redirect(next)

  return (
    <>
      <div className="grid gap-spouse">
        <h1 className="heading-md">Complete your profile</h1>
        <p className="ui-small">Just a few more details to get started.</p>
      </div>
      <OnboardingForm next={next} />
    </>
  )
}

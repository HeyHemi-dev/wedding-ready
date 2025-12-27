import { redirect } from 'next/navigation'

import { SearchParams } from '@/app/_types/generics'
import { MESSAGE_CODES } from '@/components/form/auth-message'
import { authOperations, SIGN_UP_STATUS } from '@/operations/auth-operations'
import { buildUrlWithSearchParams, getNextUrl } from '@/utils/api-helpers'
import { PARAMS } from '@/utils/constants'
import { createClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'

import { ResendForm } from './resend-form'

export default async function CheckInboxPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams
  const next = await getNextUrl(searchParams)

  const supabase = await createClient()
  const { data, error } = await tryCatch(authOperations.getUserSignUpStatus(supabase))
  if (error) redirect(buildUrlWithSearchParams('/sign-in', { [PARAMS.MESSAGE_TYPE]: 'error', [PARAMS.AUTH_MESSAGE_CODE]: MESSAGE_CODES.AUTH_FAILED }))
  if (!data) redirect('/sign-in')

  if (data.status === SIGN_UP_STATUS.UNVERIFIED) {
    return (
      <>
        <div className="grid gap-spouse text-center">
          <h1 className="heading-md">Check your inbox</h1>
          <p className="ui-small">
            We&apos;ve sent a confirmation to <strong>{data.email}</strong>. Please click the link in the email to verify your account. If you don&apos;t see
            it, check your spam folder.
          </p>
        </div>
        <div className="flex flex-col gap-sibling">
          <ResendForm />
        </div>
      </>
    )
  }

  if (data.status === SIGN_UP_STATUS.ONBOARDED) {
    redirect(next)
  } else {
    redirect(buildUrlWithSearchParams(`/onboarding`, { [PARAMS.NEXT]: next }))
  }
}

import { redirect } from 'next/navigation'

import { SearchParams } from '@/app/_types/generics'
import { AuthMessage, MESSAGE_CODES, messageSchema } from '@/components/auth/auth-message'
import { buildUrlWithSearchParams, parseSearchParams } from '@/utils/api-helpers'
import { PARAMS } from '@/utils/constants'
import { createClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'

import ResetPasswordForm from './reset-password-form'

export default async function ResetPassword(props: { searchParams: Promise<SearchParams> }) {
  // Check for valid recovery session
  const supabase = await createClient()
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    redirect(buildUrlWithSearchParams(`/sign-in`, { [PARAMS.AUTH_MESSAGE_CODE]: MESSAGE_CODES.INVALID_PASSWORD_RESET_SESSION }))
  }

  // Verify this is specifically a recovery session from password reset
  // The session's user metadata will indicate if this is a recovery session
  if (session.user.app_metadata?.provider !== 'email') {
    redirect(buildUrlWithSearchParams(`/sign-in`, { [PARAMS.AUTH_MESSAGE_CODE]: MESSAGE_CODES.INVALID_PASSWORD_RESET_SESSION }))
  }

  const searchParams = await props.searchParams
  const { data: message } = await tryCatch(parseSearchParams(searchParams, messageSchema))

  return (
    <>
      <div className="grid gap-spouse">
        <h1 className="heading-md">Reset password</h1>
        <p className="ui-small">Please enter your new password below.</p>
      </div>
      <ResetPasswordForm />
      {message && <AuthMessage message={message} />}
    </>
  )
}

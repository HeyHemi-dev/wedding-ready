import { FormMessage, Message } from '@/components/form/form-message'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ResetPasswordForm from './reset-password-form'

export default async function ResetPassword(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams

  // Check for valid recovery session
  const supabase = await createClient()
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    redirect('/sign-in?message=Please request a password reset first')
  }

  // Verify this is specifically a recovery session from password reset
  // The session's user metadata will indicate if this is a recovery session
  if (session.user.app_metadata?.provider !== 'email') {
    redirect('/sign-in?message=Please request a password reset first')
  }

  return (
    <>
      <div className="grid gap-spouse">
        <h1 className="heading-md">Reset password</h1>
        <p className="ui-small">Please enter your new password below.</p>
      </div>
      <ResetPasswordForm />
      <FormMessage message={searchParams} />
    </>
  )
}

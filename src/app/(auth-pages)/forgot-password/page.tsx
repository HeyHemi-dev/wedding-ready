import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { authActions } from '@/src/app/_actions/auth-actions'
import Field from '@/components/form/field'
import { FormMessage, Message } from '@/components/form/form-message'
import { SubmitButton } from '@/components/submit-button'
import { Input } from '@/components/ui/input'
import { encodedRedirect } from '@/utils/encoded-redirect'
import { tryCatch } from '@/utils/try-catch'

export default async function ForgotPassword(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams
  return (
    <>
      <div className="grid gap-spouse">
        <h1 className="heading-md">Reset password</h1>
        <p className="ui-small">
          Already have an account?{' '}
          <Link className="ui-small-s1 text-primary-foreground underline" href="/sign-in">
            Sign in
          </Link>
        </p>
      </div>
      <form action={forgotPasswordFormAction} className="grid gap-close-friend">
        <Field label="Email" htmlFor="email">
          <Input name="email" placeholder="you@example.com" required />
        </Field>
        <SubmitButton>Reset Password</SubmitButton>
        <FormMessage message={searchParams} />
      </form>
    </>
  )
}

async function forgotPasswordFormAction(formData: FormData) {
  'use server'
  const email = formData.get('email')?.toString()
  const origin = (await headers()).get('origin')
  const callbackUrl = formData.get('callbackUrl')?.toString()

  if (!email) {
    return encodedRedirect('error', '/forgot-password', 'Email is required')
  }

  const { error } = await tryCatch(authActions.forgotPassword({ email, origin }))

  if (error) {
    return encodedRedirect('error', '/forgot-password', 'Could not reset password')
  }

  if (callbackUrl) {
    return redirect(callbackUrl)
  }

  return encodedRedirect('success', '/forgot-password', 'Check your email for a link to reset your password.')
}

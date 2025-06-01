import Link from 'next/link'

import Field from '@/components/form/field'
import { FormMessage, Message } from '@/components/form/form-message'
import { SubmitButton } from '@/components/submit-button'
import { Input } from '@/components/ui/input'

import { forgotPasswordFormAction } from './forgot-password-form-action'

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

import Link from 'next/link'

import { forgotPasswordAction } from '@/actions/auth-actions'
import Field from '@/components/form/field'
import { FormMessage, Message } from '@/components/form/form-message'
import { SubmitButton } from '@/components/submit-button'
import { Input } from '@/components/ui/input'

import { SmtpMessage } from '../smtp-message'


export default async function ForgotPassword(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams
  return (
    <>
      <div className="grid gap-xxs">
        <h1 className="text-2xl font-medium">Reset Password</h1>
        <p className="text-sm text-secondary-foreground">
          Already have an account?{' '}
          <Link className="text-primary underline" href="/sign-in">
            Sign in
          </Link>
        </p>
      </div>
      <form action={forgotPasswordAction} className="grid gap-sm">
        <Field label="Email" htmlFor="email">
          <Input name="email" placeholder="you@example.com" required />
        </Field>
        <SubmitButton>Reset Password</SubmitButton>
        <FormMessage message={searchParams} />
      </form>
      <SmtpMessage />
    </>
  )
}

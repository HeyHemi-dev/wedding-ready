import Link from 'next/link'
import { redirect } from 'next/navigation'

import { signUpAction } from '@/actions/auth-actions'
import Field from '@/components/form/field'
import { FormMessage, Message } from '@/components/form/form-message'
import { SubmitButton } from '@/components/submit-button'
import { Input } from '@/components/ui/input'
import { getAuthenticatedUserId } from '@/utils/auth'

import { SmtpMessage } from '../smtp-message'

export default async function Signup(props: { searchParams: Promise<Message> }) {
  // If user is already logged in, they don't need to be here.
  const authUserId = await getAuthenticatedUserId()

  if (authUserId) {
    redirect('/feed')
  }

  const searchParams = await props.searchParams
  if ('message' in searchParams) {
    return (
      <div className="grid gap-sm">
        <FormMessage message={searchParams} />
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-xxs">
        <h1 className="text-2xl font-medium">Sign up</h1>
        <p className="text text-sm text-foreground">
          Already have an account?{' '}
          <Link className="font-medium text-primary underline" href="/sign-in">
            Sign in
          </Link>
        </p>
      </div>
      <form action={signUpAction} className="grid gap-sm">
        <Field label="Email" htmlFor="email">
          <Input name="email" placeholder="you@example.com" required />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input type="password" name="password" placeholder="Your password" minLength={6} required />
        </Field>
        <Field label="Name" htmlFor="displayName">
          <Input name="displayName" placeholder="Your display name" required />
        </Field>
        <Field label="Handle" htmlFor="handle">
          <Input name="handle" placeholder="your-handle" required />
        </Field>

        <SubmitButton pendingChildren={'Signing up...'}>Sign up</SubmitButton>
        <FormMessage message={searchParams} />
      </form>
      <SmtpMessage />
    </>
  )
}

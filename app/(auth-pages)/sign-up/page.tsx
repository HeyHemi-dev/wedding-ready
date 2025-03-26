import { signUpAction } from '@/actions/auth-actions'
import { FormMessage, Message } from '@/components/form-message'
import { SubmitButton } from '@/components/submit-button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { SmtpMessage } from '../smtp-message'
import Field from '@/components/form/field'

export default async function Signup(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams
  if ('message' in searchParams) {
    return (
      <div className="grid gap-md">
        <FormMessage message={searchParams} />
      </div>
    )
  }

  return (
    <>
      <form action={signUpAction} className="grid gap-md">
        <div className="grid gap-xxs">
          <h1 className="text-2xl font-medium">Sign up</h1>
          <p className="text-sm text text-foreground">
            Already have an account?{' '}
            <Link className="text-primary font-medium underline" href="/sign-in">
              Sign in
            </Link>
          </p>
        </div>

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

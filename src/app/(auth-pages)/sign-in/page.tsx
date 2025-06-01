import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import Field from '@/components/form/field'
import { FormMessage, Message } from '@/components/form/form-message'
import { SubmitButton } from '@/components/submit-button'
import { Input } from '@/components/ui/input'
import { getAuthUserId } from '@/utils/auth'

import { signInFormAction } from './signin-form-action'

export default async function Login(props: { searchParams: Promise<Message> }) {
  // If user is already logged in, they don't need to be here.
  const authUserId = await getAuthUserId()
  if (authUserId) {
    redirect('/feed')
  }

  const searchParams = await props.searchParams
  const headersList = await headers()
  const referer = headersList.get('referer') || '/feed'

  return (
    <>
      <div className="grid gap-spouse">
        <h1 className="heading-md">Log in</h1>
        <p className="ui-small">
          Don&apos;t have an account?{' '}
          <Link className="ui-small-s1 text-primary-foreground underline" href="/sign-up">
            Sign up
          </Link>
        </p>
      </div>
      <form action={signInFormAction} className="grid gap-close-friend">
        <div className="grid gap-sibling">
          <Field label="Email" htmlFor="email">
            <Input name="email" placeholder="you@example.com" required />
          </Field>
          <Field label="Password" htmlFor="password">
            <Input type="password" name="password" placeholder="Your password" required />
            <Link className="self-end text-xs text-foreground underline" href="/forgot-password">
              Forgot Password?
            </Link>
          </Field>
          <Input type="hidden" name="redirectTo" value={referer} />
        </div>
        <SubmitButton pendingChildren={'Signing In...'}>Log In</SubmitButton>
        <FormMessage message={searchParams} />
      </form>
    </>
  )
}

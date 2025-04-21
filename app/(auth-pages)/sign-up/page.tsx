import Link from 'next/link'
import { redirect } from 'next/navigation'

import { FormMessage, Message } from '@/components/form/form-message'
import { getAuthenticatedUserId } from '@/utils/auth'

import { SmtpMessage } from '../smtp-message'
import SignUpForm from './sign-up-form'

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
      <SignUpForm />
      <FormMessage message={searchParams} />
      <SmtpMessage />
    </>
  )
}

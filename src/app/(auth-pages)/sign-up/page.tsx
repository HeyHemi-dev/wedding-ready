import Link from 'next/link'
import { redirect } from 'next/navigation'

import { FormMessage, Message } from '@/components/form/form-message'
import { getAuthUserId } from '@/utils/auth'

import SignUpForm from './signup-form'

export default async function Signup(props: { searchParams: Promise<Message> }) {
  // If user is already logged in, they don't need to be here.
  const authUserId = await getAuthUserId()
  if (authUserId) {
    redirect('/feed')
  }

  const searchParams = await props.searchParams

  return (
    <>
      <div className="grid gap-spouse">
        <h1 className="heading-md">Sign up</h1>
        <p className="ui-small">
          Already have an account?{' '}
          <Link className="ui-small-s1 text-primary-foreground underline" href="/sign-in">
            Log in
          </Link>
        </p>
      </div>
      <SignUpForm />
      <FormMessage message={searchParams} />
    </>
  )
}

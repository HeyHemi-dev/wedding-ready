import { revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { authActions } from '@/app/_actions/auth-actions'
import Field from '@/components/form/field'
import { FormMessage, Message } from '@/components/form/form-message'
import { SubmitButton } from '@/components/submit-button'
import { Input } from '@/components/ui/input'
import { getAuthUserId } from '@/utils/auth'
import { encodedRedirect } from '@/utils/encoded-redirect'
import { tryCatch } from '@/utils/try-catch'


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
      <div className="grid gap-xxs">
        <h1 className="text-2xl font-medium">Sign in</h1>
        <p className="text-sm text-foreground">
          Don&apos;t have an account?{' '}
          <Link className="font-medium text-primary-foreground underline" href="/sign-up">
            Sign up
          </Link>
        </p>
      </div>
      <form action={signInFormAction} className="grid gap-sm">
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
        <SubmitButton pendingChildren={'Signing In...'}>Sign in</SubmitButton>
        <FormMessage message={searchParams} />
      </form>
    </>
  )
}

async function signInFormAction(formData: FormData) {
  'use server'
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo')?.toString() || '/feed'

  const { data: authUser, error } = await tryCatch(authActions.signIn({ email, password }))

  if (error) {
    return encodedRedirect('error', '/sign-in', error.message)
  }

  // Revalidate the user cache on successful sign in
  if (authUser) {
    revalidateTag(`user-${authUser.id}`)
  }

  return redirect(redirectTo)
}

import { signInAction } from '@/actions/auth-actions'
import { FormMessage, Message } from '@/components/form-message'
import { SubmitButton } from '@/components/submit-button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { headers } from 'next/headers'
import Field from '@/components/form/field'

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams
  const headersList = await headers()
  const referer = headersList.get('referer') || '/feed'

  return (
    <form action={signInAction} className="grid gap-md">
      <div className="grid gap-xxs">
        <h1 className="text-2xl font-medium">Sign in</h1>
        <p className="text-sm text-foreground">
          Don&apos;t have an account?{' '}
          <Link className="text-primary font-medium underline" href="/sign-up">
            Sign up
          </Link>
        </p>
      </div>
      <Field label="Email" htmlFor="email">
        <Input name="email" placeholder="you@example.com" required />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input type="password" name="password" placeholder="Your password" required />
        <Link className="text-xs text-foreground underline self-end" href="/forgot-password">
          Forgot Password?
        </Link>
      </Field>
      <Input type="hidden" name="redirectTo" value={referer} />
      <SubmitButton pendingChildren={'Signing In...'}>Sign in</SubmitButton>
      <FormMessage message={searchParams} />
    </form>
  )
}

import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function AuthCodeError() {
  return (
    <>
      <div className="grid gap-spouse text-center">
        <h1 className="heading-md">Authentication Error</h1>
        <p className="ui-small">
          We encountered an issue while verifying your authentication link. This can happen if the link has expired or has already been used.
        </p>
      </div>
      <div className="flex flex-col gap-sibling">
        <Button asChild>
          <Link href="/sign-in">Try signing in again</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/forgot-password">Request a new password reset</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/sign-up">Create a new account</Link>
        </Button>
      </div>
    </>
  )
}

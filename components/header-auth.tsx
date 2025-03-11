import { signOutAction } from '@/actions/auth-actions'

import Link from 'next/link'
import { Button } from './ui/button'
import { getCurrentUser } from '@/actions/get-current-user'

export default async function AuthButton() {
  const user = await getCurrentUser()

  return user ? (
    <div className="flex items-center gap-4">
      <Button variant={'ghost'} asChild>
        <Link href="/account" className="font-normal">
          <div className="flex flex-col items-end gap-0">
            <div className="text-sm font-normal">{user.email}</div>
            <div className="text-xs text-muted-foreground">view account</div>
          </div>
        </Link>
      </Button>
      <form action={signOutAction}>
        <Button type="submit" variant={'outline'}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={'outline'}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={'default'}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  )
}

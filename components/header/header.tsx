import Link from 'next/link'
import { Button } from '../ui/button'
import { getCurrentUser } from '@/actions/get-current-user'
import { signOutAction } from '@/actions/auth-actions'

export default function Header() {
  return (
    <header className="border-b border-b-border/50 h-headerHeight grid grid-cols-siteLayout">
      <div className="col-start-2 col-end-3 flex justify-between items-center py-3 text-sm">
        <nav className="flex gap-5 items-center font-semibold">
          <Link href={'/'}>WeddingReady</Link>
          <Link href={'/suppliers'}>Suppliers</Link>
        </nav>
        <HeaderAuth />
      </div>
    </header>
  )
}

async function HeaderAuth() {
  const user = await getCurrentUser()

  return user ? (
    <div className="flex items-center gap-sm">
      <Button variant={'ghost'} asChild>
        <Link href={`/u/${user.extended.handle}`} className="font-normal">
          <div className="flex flex-col items-end gap-0">
            <div className="text-sm font-normal">Hello, {user.extended.handle}</div>
            <div className="text-xs text-muted-foreground">view your profile</div>
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
    <div className="flex gap-sm">
      <Button asChild size="sm" variant={'outline'}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={'default'}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  )
}

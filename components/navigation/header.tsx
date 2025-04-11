import Image from 'next/image'
import Link from 'next/link'

import { signOutAction } from '@/actions/auth-actions'
import { getCurrentUser } from '@/actions/get-current-user'

import { Button } from '../ui/button'

export default function Header() {
  return (
    <header className="grid grid-cols-siteLayout">
      <div className="col-start-2 col-end-3 grid h-headerHeight grid-cols-[auto_1fr_auto] items-center gap-sm py-xs text-sm">
        <Link href={'/'} className="relative aspect-[3/2] h-full" passHref>
          <Button variant={'ghost'} className="p-0" asChild>
            <Image src={'/assets/WeddingReady_icon.png'} alt="WeddingReady" fill sizes="300px" className="object-contain" priority />
          </Button>
        </Link>
        <nav className="flex items-center gap-xxs font-semibold">
          <Link href={'/suppliers'} passHref>
            <Button variant={'ghost'}>Suppliers</Button>
          </Link>
          <Link href={'/locations'} passHref>
            <Button variant={'ghost'}>Locations</Button>
          </Link>
          <Link href={'/articles'} passHref>
            <Button variant={'ghost'}>Advice</Button>
          </Link>
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
      <Link href={`/u/${user.handle}`} passHref>
        <Button variant={'ghost'} asChild>
          <div className="flex flex-col items-end gap-0">
            <div className="text-sm font-normal">Hello, {user.handle}</div>
            <div className="text-xs font-normal text-muted-foreground">view your profile</div>
          </div>
        </Button>
      </Link>
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

import { revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'

import { authActions } from '@/app/_actions/auth-actions'
import { getCurrentUser } from '@/app/_actions/get-current-user'
import { isProtectedPath } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

import { Button } from '../ui/button'


export default function Header() {
  return (
    <header className="grid grid-cols-siteLayout">
      <div className="col-start-2 col-end-3 grid h-header grid-cols-[auto_1fr_auto] items-center gap-friend">
        <Link href={'/'} className="relative aspect-[3/2] h-full max-h-12 rounded hover:bg-primary/80" passHref>
          <Image src={'/assets/WeddingReady_icon.png'} alt="WeddingReady" fill sizes="300px" className="object-contain" priority />
        </Link>
        <nav className="flex items-center gap-sibling">
          <NavLink link={{ href: '/find-suppliers', label: 'Find Suppliers' }} />
          {/* <NavLink link={{ href: '/articles', label: 'Advice' }} /> */}
        </nav>
        <HeaderAuth />
      </div>
    </header>
  )
}

type LinkType = {
  href: string
  label: string
}

function NavLink({ link }: { link: LinkType }) {
  return (
    <Link href={link.href} className="ui-small-s1 rounded px-4 py-2 hover:bg-primary/80">
      {link.label}
    </Link>
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
      <form action={SignOutFormAction}>
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

async function SignOutFormAction() {
  'use server'
  const headersList = await headers()
  const userId = headersList.get('x-auth-user-id')
  const referer = headersList.get('referer') || '/'
  const url = new URL(referer)

  const { error } = await tryCatch(authActions.signOut())

  if (error) {
    toast.error('Failed to sign out')
    return
  }

  if (userId) {
    revalidateTag(`user-${userId}`)
  }

  const redirectTo = isProtectedPath(url.pathname) ? '/sign-in' : referer
  return redirect(redirectTo)
}

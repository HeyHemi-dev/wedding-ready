import Image from 'next/image'
import Link from 'next/link'

import { getCurrentUser } from '@/app/_actions/get-current-user'

import { Button } from '../ui/button'

import { CreditCardIcon, MoreVerticalIcon, UserCircleIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { MenuSignOutForm } from './signout-form'

export default async function Header() {
  const user = await getCurrentUser()

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
        {user ? (
          <UserMenu user={{ name: user.displayName, handle: user.handle, avatar: user.avatarUrl ?? '' }} />
        ) : (
          <div className="flex gap-sibling">
            <Button size="sm" variant={'ghost'} asChild>
              <Link href="/sign-in">Log in</Link>
            </Button>
            <Button size="sm" variant={'default'} asChild>
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </div>
        )}
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

function UserMenu({
  user,
}: {
  user: {
    name: string
    handle: string
    avatar: string
  }
}) {
  const avatarFallback = user.handle.slice(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-partner rounded-full bg-area p-contour pr-2 hover:bg-primary/80">
        <Avatar className="h-8 w-8 rounded-full">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="ui-small rounded-full bg-muted">{avatarFallback}</AvatarFallback>
        </Avatar>
        <MoreVerticalIcon className="ml-auto size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded" align="end" sideOffset={4}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-partner px-1 py-1.5">
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="ui-small rounded-full bg-muted">{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="grid leading-tight">
              <span className="ui-small-s1 truncate">{user.name}</span>
              <span className="ui-small truncate text-muted-foreground">{`@${user.handle}`}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="ui" asChild>
            <Link href={`/u/${user.handle}`}>
              <UserCircleIcon />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="ui" asChild>
            <Link href={`/account`}>
              <CreditCardIcon />
              Account
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <MenuSignOutForm />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

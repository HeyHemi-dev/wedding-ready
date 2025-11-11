'use client'

import { CreditCardIcon, LogOutIcon, MoreVerticalIcon } from 'lucide-react'
import Link from 'next/link'

import { useAuthUser } from '@/app/_hooks/use-auth-user'
import { User } from '@/app/_types/users'
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

import { NavLink } from './nav-link'
import { SignOutForm } from './signout-form'

export function HeaderAuth() {
  const { data: authUser } = useAuthUser()

  return authUser ? <SignedIn user={authUser} /> : <SignedOut />
}

function SignedOut() {
  return (
    <div className="flex gap-sibling">
      <NavLink link={{ href: '/sign-in', label: 'Log in' }} />
      <NavLink link={{ href: '/sign-up', label: 'Sign up' }} className="bg-primary" />
    </div>
  )
}

function SignedIn({ user }: { user: User }) {
  const avatarFallback = user.handle.slice(0, 2).toUpperCase()

  return (
    <div className="flex gap-hairline">
      <Link href={`/u/${user.handle}`} className="rounded-l-full bg-muted p-contour hover:bg-primary/80">
        <Avatar className="h-full rounded-full">
          <AvatarImage src={user.avatarUrl ?? ''} alt={user.displayName} />
          <AvatarFallback className="ui-small rounded-full">{avatarFallback}</AvatarFallback>
        </Avatar>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="grid aspect-[5/6] h-full place-items-center gap-partner rounded-r-full bg-muted p-contour hover:bg-primary/80"
          data-testid="user-menu-trigger">
          <MoreVerticalIcon className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded" align="end" sideOffset={4}>
          <DropdownMenuGroup>
            <DropdownMenuItem className="ui" asChild>
              <Link href={`/u/${user.handle}`}>
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage src={user.avatarUrl ?? ''} alt={user.displayName} />
                  <AvatarFallback className="ui-small rounded-full">{avatarFallback}</AvatarFallback>
                </Avatar>
                <div className="grid leading-tight">
                  <span className="ui-small-s1 truncate">{user.displayName}</span>
                  <span className="ui-small truncate text-muted-foreground">{`@${user.handle}`}</span>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className="ui" asChild>
              <Link href={`/account`}>
                <CreditCardIcon />
                Account
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {user.suppliers.length > 0 && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Suppliers</DropdownMenuLabel>
                {user.suppliers.map((supplier) => (
                  <DropdownMenuItem key={supplier.id} inset asChild>
                    <Link href={`/account/manage-suppliers/${supplier.handle}`}>{supplier.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          )}
          <SignOutForm>
            <DropdownMenuItem className="ui">
              <LogOutIcon />
              Sign out
            </DropdownMenuItem>
          </SignOutForm>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

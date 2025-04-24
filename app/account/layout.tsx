'use client'

import { User, Settings, Contact, LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Section } from '@/components/ui/section'
import { cn } from '@/utils/shadcn-utils'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <Section>
      <div className="grid grid-cols-1 gap-md md:grid-cols-[minmax(200px,1fr)_3fr] md:grid-rows-[auto_1fr]">
        <div className="grid gap-md md:col-start-1 md:row-span-full md:grid-rows-subgrid">
          <nav className="row-start-2 grid auto-rows-fr gap-xxs self-start">
            <AccountNavLink
              href="/account"
              currentPathname={pathname}
              title="Profile"
              description="Personalize your name, avatar, bio and social links."
              Icon={User}
            />
            <AccountNavLink
              href="/account/account-settings"
              currentPathname={pathname}
              title="Account & Security"
              description="Update your email, password and user handle."
              Icon={Settings}
            />
            <AccountNavLink
              href="/account/manage-suppliers"
              currentPathname={pathname}
              title="My Suppliers"
              description="Add, edit or remove the suppliers you manage."
              Icon={Contact}
            />
            {/* <AccountNavLink
            href="/account/notifications"
            currentPathname={pathname}
            title="Notifications"
            description="Choose which alerts you receive and how."
            Icon={Bell}
          />
          <AccountNavLink
            href="/account/privacy"
            currentPathname={pathname}
            title="Privacy"
            description="Control your data, visibility and permissions."
            Icon={Lock}
          /> */}
          </nav>
        </div>
        <div className="grid gap-sm md:col-start-2 md:row-span-full md:grid-rows-subgrid">{children}</div>
      </div>
    </Section>
  )
}

function AccountNavLink({
  href,
  currentPathname,
  title,
  description,
  Icon,
}: {
  href: string
  currentPathname: string
  title: string
  description: string
  Icon: LucideIcon
}) {
  const isActive = currentPathname === href

  return (
    <Link
      href={href}
      className={cn(
        'grid h-auto max-w-full grid-cols-[auto_1fr] grid-rows-[auto_1fr] gap-x-xs gap-y-xxs rounded-md px-sm py-sm hover:bg-accent',
        isActive && 'bg-muted'
      )}>
      <Icon className="row-span-2 self-start text-muted-foreground" size={20} />
      <p className="text-sm">{title}</p>
      <p className="text-pretty text-xs text-muted-foreground">{description}</p>
    </Link>
  )
}

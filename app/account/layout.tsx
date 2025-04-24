import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { User, LucideIcon, Settings, Contact, Bell, Lock } from 'lucide-react'
import { cn } from '@/utils/shadcn-utils'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <Section>
      <div className="grid grid-cols-1 gap-md md:grid-cols-[minmax(200px,1fr)_3fr]">
        <nav className="grid auto-rows-fr self-start">
          <AccountNavLink href="/account" title="Profile" description="Personalize your name, avatar, bio and social links." Icon={User} />
          <AccountNavLink
            href="/account/account-settings"
            title="Account & Security"
            description="Update your email, password and user handle."
            Icon={Settings}
          />
          <AccountNavLink href="/account/manage-suppliers" title="My Suppliers" description="Add, edit or remove the suppliers you manage." Icon={Contact} />
          <AccountNavLink href="/account/notifications" title="Notifications" description="Choose which alerts you receive and how." Icon={Bell} />
          <AccountNavLink href="/account/privacy" title="Privacy" description="Control your data, visibility and permissions." Icon={Lock} />
        </nav>
        {children}
      </div>
    </Section>
  )
}

function AccountNavLink({
  href,
  title,
  description,
  Icon,
  isActive = false,
}: {
  href: string
  title: string
  description: string
  Icon: LucideIcon
  isActive?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'grid h-auto max-w-full grid-cols-[auto_1fr] grid-rows-[auto_1fr] gap-x-xs gap-y-xxs rounded-md px-sm py-sm hover:bg-accent',
        isActive && 'bg-accent'
      )}>
      <Icon className="row-span-2 self-start text-muted-foreground" size={20} />
      <p className="text-sm">{title}</p>
      <p className="text-pretty text-xs text-muted-foreground">{description}</p>
    </Link>
  )
}

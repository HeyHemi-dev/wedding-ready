import { Button } from '@/components/ui/button'
import Section from '@/components/ui/section'
import Link from 'next/link'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <Section>
      <div className="grid grid-cols-1 md:grid-cols-[minmax(200px,1fr)_3fr] gap-md">
        <nav className="flex flex-col gap-2">
          <Link href="/account">
            <Button variant={'ghost'}>Public Profile</Button>
          </Link>
          <Link href="/account/account-settings">
            <Button variant={'ghost'}>Account Settings</Button>
          </Link>
          <Link href="/account/link-suppliers">
            <Button variant={'ghost'}>Linked Suppliers</Button>
          </Link>
          <Link href="/account">
            <Button variant={'ghost'}>Notifications</Button>
          </Link>
          <Link href="/account">
            <Button variant={'ghost'}>Privacy</Button>
          </Link>
        </nav>
        {children}
      </div>
    </Section>
  )
}

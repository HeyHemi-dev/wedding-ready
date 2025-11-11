import { Href } from '@/app/_types/generics'
import { cn } from '@/utils/shadcn-utils'
import Link from 'next/link'

export function NavLink({ link, className }: { link: Href; className?: string }) {
  return (
    <Link href={link.href} className={cn('ui-small-s1 flex h-full items-center rounded-full px-4 py-1 hover:bg-primary/80', className)}>
      {link.label}
    </Link>
  )
}

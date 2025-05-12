import { ReactNode } from 'react'

import { cn } from '@/utils/shadcn-utils'

export function ActionBar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('h-action-bar grid items-center rounded-full bg-secondary p-xxs', className)}>{children}</div>
}

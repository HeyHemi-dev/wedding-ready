import { ReactNode } from 'react'

import { cn } from '@/utils/shadcn-utils'

export function ActionBar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('h-action-bar bg-secondary p-2xs grid items-center rounded-full', className)}>{children}</div>
}

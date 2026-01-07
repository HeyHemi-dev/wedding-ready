import React from 'react'

import { cn } from '@/utils/shadcn-utils'

interface TableProps extends React.HTMLAttributes<HTMLDivElement> {}

interface TableCellProps extends React.HTMLAttributes<HTMLDivElement> {
  isFeatured?: boolean
  isFrozen?: boolean
}

export function Table({ className, children, ...props }: TableProps) {
  return (
    <div className={cn('grid overflow-x-auto', className)} {...props}>
      {children}
    </div>
  )
}

export function TableCell({ className, isFeatured, isFrozen, children, ...props }: TableCellProps) {
  return (
    <div
      className={cn(
        'ui grid items-center justify-items-center border-t border-border p-6 text-center',
        isFeatured && 'bg-area',
        isFrozen && 'pointer-events-none sticky left-0 z-10 bg-background shadow-[3px_0px_3px_-1px_rgba(0,_0,_0,_0.1)]',
        className
      )}
      {...props}>
      {children}
    </div>
  )
}

export function TableHeaderCell({ className, isFeatured, children, ...props }: TableCellProps) {
  return (
    <TableCell className={cn('border-t-0', isFeatured && 'rounded-t-area pt-area', className)} isFeatured={isFeatured} {...props}>
      {children}
    </TableCell>
  )
}

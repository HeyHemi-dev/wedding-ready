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
        'ui grid items-center justify-items-center p-6 text-center',
        isFeatured && 'bg-area',
        isFrozen && 'sticky left-0 z-10 bg-background',
        className
      )}
      {...props}>
      {children}
    </div>
  )
}

export function TableHeaderCell({ className, children, ...props }: TableCellProps) {
  return (
    <TableCell className={cn('rounded-t-area pt-area', className)} {...props}>
      {children}
    </TableCell>
  )
}

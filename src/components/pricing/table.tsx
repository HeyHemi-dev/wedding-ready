import React from 'react'

import { cn } from '@/utils/shadcn-utils'

interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  isFirstColFrozen?: boolean
}

interface TableCellProps extends React.HTMLAttributes<HTMLDivElement> {
  isAccent?: boolean
}

interface TableRowProps extends React.HTMLAttributes<HTMLDivElement> {
  hasAccentOnHover?: boolean
}

export function Table({ isFirstColFrozen = false, className, children, ...props }: TableProps) {
  return (
    <div
      data-element="table"
      className={cn(
        'grid rounded-area',
        isFirstColFrozen &&
          'overflow-x-auto [&_[data-element="table-row"]>*:first-child]:sticky [&_[data-element="table-row"]>*:first-child]:left-0 [&_[data-element="table-row"]>*:first-child]:z-10 [&_[data-element="table-row"]>*:first-child]:border-r [&_[data-element="table-row"]>*:first-child]:border-accent-foreground/10 [&_[data-element="table-row"]>*:first-child]:bg-background',
        className
      )}
      {...props}>
      {children}
    </div>
  )
}

export function TableRow({ hasAccentOnHover = false, className, children, ...props }: TableRowProps) {
  return (
    <div
      data-element="table-row"
      className={cn(
        'relative col-span-full grid grid-cols-subgrid border-t border-accent-foreground/10 before:pointer-events-none before:absolute before:inset-0 before:z-20 before:bg-accent/40 before:opacity-0 before:mix-blend-multiply before:content-[""] first:border-none hover:before:opacity-100',
        className
      )}
      {...props}>
      {children}
    </div>
  )
}

export function TableCell({ className, isAccent = false, children, ...props }: TableCellProps) {
  return (
    <div
      data-element="table-cell"
      className={cn('row-span-full grid place-content-center px-6 py-4 text-center', isAccent && 'bg-accent/60', className)}
      {...props}>
      {children}
    </div>
  )
}

import * as React from 'react'

import { cn } from '@/utils/shadcn-utils'

export const Area = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('area tablet:px-area px-md', className)} {...props}>
      {children}
    </div>
  )
})
Area.displayName = 'Area'

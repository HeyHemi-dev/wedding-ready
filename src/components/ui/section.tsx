import * as React from 'react'

import { cn } from '@/utils/shadcn-utils'

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const Section = React.forwardRef<HTMLDivElement, SectionProps>(({ children, className, ...props }, ref) => {
  return (
    <section ref={ref} className={cn('grid grid-cols-siteLayout py-sectionPadding', className)} {...props}>
      <div className="col-start-2 col-end-3 grid grid-cols-1 gap-friend overflow-clip">{children}</div>
    </section>
  )
})
Section.displayName = 'Section'

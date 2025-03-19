import { cn } from '@/utils/shadcn-utils'

interface SectionProps {
  children: React.ReactNode
  sectionClassName?: string
  containerClassName?: string
}

export default function Section({ children, sectionClassName, containerClassName }: SectionProps) {
  return (
    <section className={cn('grid grid-cols-siteLayout', sectionClassName)}>
      <div className={cn('py-sectionPadding col-start-2 col-end-3 grid grid-cols-1 gap-md', containerClassName)}>{children}</div>
    </section>
  )
}

import { cn } from '@/utils/shadcn-utils'

interface SectionProps {
  children: React.ReactNode
  sectionClassName?: string
  containerClassName?: string
}

export default function Section({ children, sectionClassName, containerClassName }: SectionProps) {
  return (
    <section className={cn('grid grid-cols-[auto_minmax(0,_1200px)_auto]', sectionClassName)}>
      <div className={cn('py-sectionPadding px-sitePadding col-start-2 col-end-3', containerClassName)}>{children}</div>
    </section>
  )
}

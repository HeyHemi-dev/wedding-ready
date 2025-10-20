import type { ReactNode } from 'react'

import { ChevronDown } from 'lucide-react'

import { cn } from '@/utils/shadcn-utils'

interface FAQItemProps {
  question: string
  content: ReactNode
  className?: string
}

export function FAQItem({ question, content, className }: FAQItemProps) {
  return (
    <details name={'faq'} className={cn('group', className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-sibling">
        <span className="ui-large">{question}</span>
        <ChevronDown className="h-6 w-6 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="-translate-y-4 py-6 text-foreground/80 opacity-0 transition-all duration-200 group-open:translate-y-0 group-open:opacity-100">
        <div className="prose ui flex flex-col gap-sibling text-pretty">{content}</div>
      </div>
    </details>
  )
}

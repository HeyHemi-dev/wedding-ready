import type { ReactNode } from 'react'

import { ChevronDown } from 'lucide-react'

import { cn } from '@/utils/shadcn-utils'

interface FAQProps {
  question: string
  content: ReactNode
}

export function FAQ({ question, content }: FAQProps) {
  return (
    <details name={'faq'} className="group border-b border-border p-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-sibling">
        <h3 className="ui-large max-w-prose">{question}</h3>
        <ChevronDown className="h-6 w-6 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="-translate-y-4 py-6 text-foreground/80 opacity-0 transition-all duration-200 group-open:translate-y-0 group-open:opacity-100">
        <div className="prose ui flex max-w-prose flex-col gap-sibling text-pretty">{content}</div>
      </div>
    </details>
  )
}

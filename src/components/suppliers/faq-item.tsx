import { ChevronDown } from 'lucide-react'

interface FAQItemProps {
  question: string
  children: React.ReactNode
}

export function FAQItem({ question, children }: FAQItemProps): React.ReactElement {
  return (
    <details name={'faq'} className="group border-border">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-sibling">
        <span className="heading-sm">{question}</span>
        <ChevronDown className="h-6 w-6 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="-translate-y-4 py-4 text-foreground/80 opacity-0 transition-all duration-200 group-open:translate-y-0 group-open:opacity-100">
        {children}
      </div>
    </details>
  )
}

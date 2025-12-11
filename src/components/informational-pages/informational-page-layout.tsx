import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'
import { micromark } from 'micromark'

export function InformationalPageLayout({ title, markdown, children }: { title: string; markdown: string; children?: React.ReactNode }) {
  const html = micromark(markdown)

  return (
    <Section className="min-h-svh-minus-header pt-0">
      <Area className="grid justify-center gap-acquaintance bg-transparent">
        <div className="grid gap-spouse">
          <h1 className="heading-2xl">{title}</h1>
          <div className="prose numbered-headings grid max-w-prose gap-sibling" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        {children}
      </Area>
    </Section>
  )
}

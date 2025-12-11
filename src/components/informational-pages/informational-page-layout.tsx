import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'
import { marked } from '@/utils/marked/client'

// branded type for markdown content
export type UnsafeMarkdown = string & { __brand: 'markdown' }

export function InformationalPageLayout({ title, content, children }: { title: string; content: UnsafeMarkdown; children?: React.ReactNode }) {
  const html = marked.parse(content)

  return (
    <Section className="min-h-svh-minus-header pt-0">
      <Area className="grid justify-center gap-acquaintance bg-transparent">
        <div className="grid gap-spouse">
          <h1 className="heading-2xl">{title}</h1>
          <div className="prose grid max-w-prose gap-sibling" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        {children}
      </Area>
    </Section>
  )
}

import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Section className="h-svh-minus-header pt-0">
      <Area>
        <div className="mx-auto grid w-full max-w-md gap-md">{children}</div>
      </Area>
    </Section>
  )
}

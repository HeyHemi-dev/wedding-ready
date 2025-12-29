import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Section className="min-h-svh-minus-header pt-0">
      <Area className="grid place-content-center">
        <div className="grid max-w-sm gap-friend pb-[15vh]">{children}</div>
      </Area>
    </Section>
  )
}

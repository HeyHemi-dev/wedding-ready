import { Section } from '@/components/ui/section'

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Section>
      <div className="mx-auto grid w-full max-w-md gap-md">{children}</div>
    </Section>
  )
}

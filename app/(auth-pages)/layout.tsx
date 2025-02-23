import Section from '@/components/ui/section'

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Section>
      <div className="max-w-7xl flex flex-col gap-12 items-start">{children}</div>
    </Section>
  )
}

import Section from '@/components/ui/section'

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Section>
      <div className="grid gap-md w-full max-w-md mx-auto">{children}</div>
    </Section>
  )
}

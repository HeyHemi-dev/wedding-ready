import Section from '@/components/ui/section'

export default async function UserPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params

  return (
    <Section>
      <h1>UserPage for {handle}</h1>
    </Section>
  )
}

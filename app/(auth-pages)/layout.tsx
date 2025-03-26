import Section from '@/components/ui/section'

export default async function Layout({ children }: { children: React.ReactNode }) {
  return <Section>{children}</Section>
}

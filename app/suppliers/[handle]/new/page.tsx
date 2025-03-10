import Section from '@/components/ui/section'
import { getCurrentUser } from '@/actions/get-current-user'
import { redirect } from 'next/navigation'

export default async function NewSupplierTilePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/sign-in')
  }

  return (
    <Section>
      <h1>New Supplier Tile</h1>
    </Section>
  )
}

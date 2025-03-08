import { getCurrentUser } from '@/actions/getCurrentUser'
import SupplierActions from '@/actions/supplierActions'
import Section from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'

export default async function SupplierPage({ params }: { params: { handle: string } }) {
  const supplier = await SupplierActions.getByHandle(params.handle)

  if (!supplier) {
    redirect(`/404`)
  }

  // Check if the user is the owner of the supplier to enable edit features
  const user = await getCurrentUser()
  const isSupplierUser = supplier?.users.some((u) => u.userId === user?.id)

  return (
    <Section>
      <h1>{supplier.name}</h1>
      {isSupplierUser && <p>You can edit this page</p>}
    </Section>
  )
}

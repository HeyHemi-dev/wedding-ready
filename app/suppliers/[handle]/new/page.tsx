import Section from '@/components/ui/section'
import { getCurrentUser } from '@/actions/get-current-user'
import { redirect } from 'next/navigation'
import { SupplierModel } from '@/models/supplier'
import { CustomUploadForm } from './custom-upload-form'

export default async function NewSupplierTilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const supplier = await SupplierModel.getByHandle(handle)

  if (!supplier) {
    redirect(`/404`)
  }

  // Check if the user is the owner of the supplier to allow creating tiles
  const user = await getCurrentUser()
  const isSupplierUser = supplier?.users.some((u) => u.userId === user?.id)

  if (!user || !isSupplierUser) {
    redirect(`/suppliers/${handle}`)
  }

  return (
    <Section>
      <h1>Create new tiles for {supplier.name}</h1>

      <CustomUploadForm supplier={supplier} user={user} />
    </Section>
  )
}

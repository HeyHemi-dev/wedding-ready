import Section from '@/components/ui/section'
import { getCurrentUser } from '@/actions/get-current-user'
import { redirect } from 'next/navigation'
import { SupplierModel } from '@/models/supplier'
import { CustomUploadForm } from './custom-upload-form'

export default async function NewSupplierTilePage({ params }: { params: { handle: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/sign-in')
  }

  const supplier = await SupplierModel.getByHandle(params.handle)
  if (!supplier) {
    redirect('/suppliers')
  }

  return (
    <Section>
      <h1>Create new tiles for {supplier.name}</h1>

      <CustomUploadForm supplier={supplier} />
    </Section>
  )
}

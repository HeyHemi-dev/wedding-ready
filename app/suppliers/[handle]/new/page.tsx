import Section from '@/components/ui/section'
import { getCurrentUser } from '@/actions/get-current-user'
import { redirect } from 'next/navigation'
import UploadForm from './upload-form'
import { Suspense } from 'react'
export default async function NewSupplierTilePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/sign-in')
  }

  return (
    <Section>
      <h1>New Supplier Tile</h1>

      <UploadForm />
    </Section>
  )
}

import Section from '@/components/ui/section'
import { getCurrentUser } from '@/actions/get-current-user'
import { redirect } from 'next/navigation'
import { SupplierModel } from '@/models/supplier'
import { UploadDropzone } from './upload-dropzone'
import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'

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
      <Link href={`/suppliers/${handle}`} className="flex items-center gap-2 text-muted-foreground">
        <ArrowLeftIcon size={16} />
        {supplier.name}
      </Link>
      <h1 className="text-2xl font-semibold">Create new tiles for {supplier.name}</h1>

      <UploadDropzone supplier={supplier} user={user} />
    </Section>
  )
}

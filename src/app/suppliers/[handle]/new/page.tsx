import React from 'react'

import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Section } from '@/components/ui/section'
import { supplierOperations } from '@/operations/supplier-operations'
import { getAuthUserId } from '@/utils/auth'

import { UploadProvider } from './upload-context'
import { UploadDropzone } from './upload-dropzone'

export default async function NewSupplierTilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const supplier = await supplierOperations.getByHandle(handle)

  if (!supplier) {
    notFound()
  }

  // Check if the user is the owner of the supplier to allow creating tiles
  const authUserId = await getAuthUserId()
  const isSupplierUser = supplier.users.some((u) => u.id === authUserId)

  if (!authUserId || !isSupplierUser) {
    redirect(`/suppliers/${handle}`)
  }

  return (
    <Section>
      <Link href={`/suppliers/${handle}`} className="flex items-center gap-2 text-muted-foreground">
        <ArrowLeftIcon size={16} />
        {supplier.name}
      </Link>
      <h1 className="text-2xl font-semibold">Create new tiles for {supplier.name}</h1>

      <UploadProvider>
        <UploadDropzone supplier={supplier} userId={authUserId} />
      </UploadProvider>
    </Section>
  )
}

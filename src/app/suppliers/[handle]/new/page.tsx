import React from 'react'

import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { handleSchema } from '@/app/_types/validation-schema'
import { Section } from '@/components/ui/section'
import { supplierOperations } from '@/operations/supplier-operations'
import { getAuthUserId } from '@/utils/auth'

import { UploadProvider } from './upload-context'
import { UploadLayout } from './upload-layout'

export default async function NewSupplierTilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const { success, error: parseError } = handleSchema.safeParse(handle)
  if (!success || parseError) return notFound()

  const supplier = await supplierOperations.getByHandle(handle)
  if (!supplier) return notFound()

  // Check if the user is the owner of the supplier to allow creating tiles
  const authUserId = await getAuthUserId()
  if (!authUserId) redirect(`/suppliers/${handle}`)

  const isSupplierUser = supplier.users.some((u) => u.id === authUserId)
  if (!isSupplierUser) redirect(`/suppliers/${handle}`)

  return (
    <Section>
      <Link href={`/suppliers/${handle}`} className="flex items-center gap-2 text-muted-foreground">
        <ArrowLeftIcon size={16} />
        {supplier.name}
      </Link>
      <h1 className="text-2xl font-semibold">Create new tiles for {supplier.name}</h1>

      <UploadProvider>
        <UploadLayout supplier={supplier} userId={authUserId} />
      </UploadProvider>
    </Section>
  )
}

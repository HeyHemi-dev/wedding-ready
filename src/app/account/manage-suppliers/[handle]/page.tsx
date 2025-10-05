import { notFound, redirect } from 'next/navigation'

import { supplierOperations } from '@/operations/supplier-operations'
import { getAuthUserId } from '@/utils/auth'

import UpdateSupplierForm from './update-supplier-form'

export default async function SupplierEditPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const supplier = await supplierOperations.getByHandle(handle)
  if (!supplier) {
    notFound()
  }

  const authUserId = await getAuthUserId()
  const authUserRole = supplier?.users.find((u) => u.id === authUserId)?.role
  if (!authUserId || !authUserRole) {
    redirect(`/suppliers/${handle}`)
  }

  return (
    <div className="grid gap-acquaintance">
      <div className="grid gap-partner">
        <h1 className="heading-lg">Edit {supplier.name}</h1>
        <p className="ui-small text-muted-foreground">Update supplier profile and manage user roles.</p>
      </div>

      <div className="grid gap-friend">
        <h2 className="ui-s2">Update profile</h2>
        <UpdateSupplierForm
          defaultValues={{
            name: supplier.name,
            websiteUrl: supplier.websiteUrl ?? undefined,
            description: supplier.description ?? undefined,
          }}
          supplierId={supplier.id}
          authUserId={authUserId}
        />
      </div>

      <div className="grid gap-friend">
        <h2 className="ui-s2">Manage users</h2>
        <pre className="whitespace-pre-wrap rounded border bg-muted p-3 font-mono text-xs text-muted-foreground">{JSON.stringify(authUserRole, null, 2)}</pre>
      </div>
    </div>
  )
}

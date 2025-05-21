import { eq } from 'drizzle-orm'
import { ArrowRightIcon, Plus } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { db } from '@/db/db'
import * as schema from '@/db/schema'
import { getAuthUserId } from '@/utils/auth'
import { valueToPretty } from '@/utils/enum-helpers'

export default async function ManageSuppliers() {
  const authUserId = await getAuthUserId()
  if (!authUserId) {
    redirect('/sign-in')
  }

  const suppliers = await db
    .select({ ...schema.supplierColumns, role: schema.supplierUsers.role })
    .from(schema.suppliers)
    .innerJoin(schema.supplierUsers, eq(schema.suppliers.id, schema.supplierUsers.supplierId))
    .where(eq(schema.supplierUsers.userId, authUserId))

  return (
    <div className="grid gap-acquaintance">
      <div className="grid gap-partner">
        <h1 className="heading-lg">My Suppliers</h1>
        <p className="ui-small text-muted-foreground">View and manage your supplier accounts.</p>
      </div>

      <div className="flex flex-col gap-sibling">
        <div className="flex items-center justify-between gap-friend">
          <h3 className="ui-s1">Your supplier accounts</h3>
          <Button variant={'ghost'} size="sm" className="flex items-center gap-spouse" asChild>
            <Link href="/suppliers/register">
              <Plus className="h-4 w-4" />
              <span>Register new supplier</span>
            </Link>
          </Button>
        </div>

        {suppliers.length > 0 ? (
          <ul className="flex flex-col gap-sibling">
            {suppliers.map((supplier) => (
              <li key={supplier.id}>
                <SupplierCard name={supplier.name} handle={supplier.handle} currentUserRole={supplier.role} href={`/suppliers/${supplier.handle}`} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="ui-small text-muted-foreground">No suppliers found</p>
        )}
      </div>
    </div>
  )
}

function SupplierCard({ name, handle, currentUserRole, href }: { name: string; handle: string; currentUserRole: string; href: string }) {
  return (
    <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-sibling">
      <div className="flex flex-col">
        <p className="ui-small-s1">{name}</p>
        <p className="ui-small text-muted-foreground">{`@${handle}`}</p>
      </div>

      <p className="ui-small-s1">{`${valueToPretty(currentUserRole)} role`}</p>
      <Button variant={'link'} className="flex items-center gap-spouse" asChild>
        <Link href={href}>
          <span className="ui-small-s1">View profile</span>
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}

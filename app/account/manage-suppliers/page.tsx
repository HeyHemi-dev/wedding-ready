import { eq } from 'drizzle-orm'
import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
    <div className="flex flex-col gap-md">
      <div className="flex flex-col gap-xxs">
        <h1 className="text-2xl">Linked Suppliers</h1>
        <p className="text-sm text-muted-foreground">View supplier accounts you belong to and register a new supplier.</p>
      </div>
      {suppliers.length > 0 ? (
        <ul className="flex flex-col gap-lg">
          {suppliers.map((supplier) => (
            <li key={supplier.id}>
              <Card className="grid grid-cols-[1fr_1fr_auto] items-center gap-md p-md">
                <div className="flex items-center gap-md">
                  <div className="flex h-xl w-xl items-center justify-center rounded-full bg-muted">
                    <p className="text-sm font-medium">{supplier.name.charAt(0)}</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{supplier.name}</p>
                    <p className="text-xs text-muted-foreground">{`@${supplier.handle}`}</p>
                  </div>
                </div>
                <p className="text-sm font-medium">{`${valueToPretty(supplier.role)} role`}</p>

                <Link href={`/suppliers/${supplier.handle}`}>
                  <Button variant={'ghost'} className="flex items-center gap-xxs">
                    View Profile <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <p>No suppliers linked</p>
      )}
      <Link href="/suppliers/register">
        <Button>Register a new supplier</Button>
      </Link>
    </div>
  )
}

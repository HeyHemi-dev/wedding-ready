import { db } from '@/db/db'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import * as schema from '@/db/schema'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { valueToPretty } from '@/utils/enum-to-pretty'

import { Card } from '@/components/ui/card'
import { ArrowRightIcon } from 'lucide-react'
import { getAuthenticatedUserId } from '@/utils/auth'

export default async function LinkSuppliers() {
  const authUserId = await getAuthenticatedUserId()
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
                  <div className="w-xl h-xl rounded-full bg-muted flex items-center justify-center">
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
                    View Profile <ArrowRightIcon className="w-4 h-4" />
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

import { getCurrentUser } from '@/actions/get-current-user'
import { db } from '@/db/db'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import * as schema from '@/db/schema'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { valueToPretty } from '@/utils/enum-to-pretty'

export default async function LinkSuppliers() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/sign-in')
  }

  const suppliers = await db
    .select({ ...schema.supplierColumns, role: schema.supplierUsers.role })
    .from(schema.suppliers)
    .innerJoin(schema.supplierUsers, eq(schema.suppliers.id, schema.supplierUsers.supplierId))
    .where(eq(schema.supplierUsers.userId, user.id))

  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-col gap-xxs">
        <h1 className="text-2xl">Linked Suppliers</h1>
        <p className="text-sm text-muted-foreground">Register a supplier to your account</p>
      </div>
      {suppliers.length > 0 ? (
        <ul className="flex flex-col gap-xs">
          {suppliers.map((supplier) => (
            <li key={supplier.id} className="grid grid-cols-[1fr_auto] items-center gap-md">
              <div className="flex items-center gap-xs">
                <div className="w-xl h-xl rounded-full bg-muted flex items-center justify-center">
                  <p className="text-sm font-medium">{supplier.name.charAt(0)}</p>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{supplier.name}</p>
                  <p className="text-xs text-muted-foreground">{`@${supplier.handle}`}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-sm font-medium">{valueToPretty(supplier.role)}</p>
                <p className="text-xs text-muted-foreground">your role</p>
              </div>
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

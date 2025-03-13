import { getCurrentUser } from '@/actions/get-current-user'
import { SupplierModel } from '@/models/supplier'
import Section from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { db } from '@/db/db'
import { tiles as tilesTable, tileSuppliers as tileSuppliersTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
export default async function SupplierPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const supplier = await SupplierModel.getByHandle(handle)

  if (!supplier) {
    redirect(`/404`)
  }

  // Check if the user is the owner of the supplier to enable edit features
  const user = await getCurrentUser()
  const isSupplierUser = supplier?.users.some((u) => u.userId === user?.id)

  // Get tiles for supplier
  const result = await db
    .select()
    .from(tilesTable)
    .leftJoin(tileSuppliersTable, eq(tilesTable.id, tileSuppliersTable.tileId))
    .where(eq(tileSuppliersTable.supplierId, supplier.id))

  const tiles = result.map((r) => r.tiles).filter((tile): tile is NonNullable<typeof tile> => tile !== null)

  return (
    <>
      <Section>
        {isSupplierUser && <p>You can edit this page</p>}
        <div className="flex gap-4 items-baseline">
          <h1 className="text-2xl font-bold">{supplier.name}</h1>
          <p className="text-muted-foreground">{supplier.handle}</p>
        </div>
        {supplier.description && <p>{supplier.description}</p>}
        {supplier.websiteUrl && <p>{supplier.websiteUrl}</p>}
        <div className="flex flex-wrap gap-2">
          {supplier.locations.map((location) => (
            <Badge variant={'secondary'} key={location}>
              {location}
            </Badge>
          ))}
        </div>
      </Section>
      <Section>
        {tiles.length > 0
          ? tiles.map((tile) => <p key={tile.id}>{tile.title}</p>)
          : noTiles({
              message: `${supplier.name} has no tiles`,
              cta: { text: 'Add a tile', redirect: `/suppliers/${handle}/new`, show: isSupplierUser },
            })}
      </Section>
    </>
  )
}

interface noTilesProps {
  message: string
  cta?: {
    text: string
    redirect: string
    show?: boolean
  }
}

function noTiles({ message, cta }: noTilesProps) {
  'use client'
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <p className="text-muted-foreground">{message}</p>
      {cta && cta.show && (
        <Link href={cta.redirect}>
          <Button variant={'outline'}>{cta.text}</Button>
        </Link>
      )}
    </div>
  )
}

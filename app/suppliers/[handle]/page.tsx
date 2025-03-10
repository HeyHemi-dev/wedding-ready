import { getCurrentUser } from '@/actions/get-current-user'
import SupplierActions from '@/models/supplier-actions'
import Section from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { db } from '@/db/db'
import { tiles as tilesTable, tileSuppliers as tileSuppliersTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

export default async function SupplierPage({ params }: any) {
  const { handle } = await params
  const supplier = await SupplierActions.getByHandle(handle)

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
        <h1 className="text-2xl font-bold">{supplier.name}</h1>

        <p className="text-muted-foreground">{supplier.handle}</p>
        <p>{supplier.description}</p>
        <p>{supplier.websiteUrl}</p>
        {supplier.locations.map((location) => (
          <p key={location.id}>{location.name}</p>
        ))}
      </Section>
      <Section>
        {tiles.length > 0
          ? tiles.map((tile) => <p key={tile.id}>{tile.title}</p>)
          : noTiles({ message: `${supplier.name} has no tiles`, cta: { text: 'Add a tile', redirect: `/suppliers/${handle}/new` } })}
      </Section>
    </>
  )
}

interface noTilesProps {
  message: string
  cta?: {
    text: string
    redirect: string
  }
}

function noTiles({ message, cta }: noTilesProps) {
  'use client'
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p>{message}</p>
      {cta && (
        <Link href={cta.redirect}>
          <Button>{cta.text}</Button>
        </Link>
      )}
    </div>
  )
}

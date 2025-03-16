import { getCurrentUser } from '@/actions/get-current-user'
import { SupplierModel } from '@/models/supplier'
import Section from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { TileModel } from '@/models/tile'
import { TileList, TileListSkeleton } from '@/components/tile-list'
import { Suspense } from 'react'

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
  const tiles = await TileModel.getBySupplier(supplier, user ? user : undefined)

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
      <Section containerClassName="pt-0">
        <Suspense fallback={<TileListSkeleton />}>
          {tiles.length > 0 ? (
            <>
              <div className="flex justify-end">
                <Link href={`/suppliers/${handle}/new`}>
                  <Button variant={'default'}>Add More Tiles</Button>
                </Link>
              </div>
              <TileList tiles={tiles} />
            </>
          ) : (
            noTiles({
              message: `${supplier.name} has no tiles`,
              cta: { text: 'Add a tile', redirect: `/suppliers/${handle}/new`, show: isSupplierUser },
            })
          )}
        </Suspense>
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

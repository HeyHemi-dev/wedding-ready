import { getCurrentUser } from '@/actions/get-current-user'
import { SupplierModel } from '@/models/supplier'
import Section from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { TileModel } from '@/models/tile'
import { TileList, TileListSkeleton } from '@/components/tiles/tile-list'
import { Suspense } from 'react'
import { ExternalLinkIcon, HeartIcon, SquarePlusIcon } from 'lucide-react'
import { Supplier } from '@/models/types'

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
        <div className="grid grid-cols-[theme(spacing.textLength)_auto] gap-md">
          <div className="grid gap-md">
            <SupplierHeader supplier={supplier} />
            <div className="flex gap-sm">
              {user && (
                <Button variant={'default'} className="gap-xs">
                  <HeartIcon className="w-4 h-4" />
                  Add To Favourites
                </Button>
              )}
              {supplier.websiteUrl && (
                <Link href={supplier.websiteUrl} target="_blank">
                  <Button variant={'secondary'} className="gap-xs">
                    <ExternalLinkIcon className="w-4 h-4" />
                    Visit Website
                  </Button>
                </Link>
              )}
            </div>
          </div>
          {tiles.length > 0 && (
            <div className="flex place-self-end">
              <Link href={`/suppliers/${handle}/new`}>
                <Button variant={'secondary'} className="gap-xs">
                  <SquarePlusIcon className="w-4 h-4" />
                  Create Tile
                </Button>
              </Link>
            </div>
          )}
        </div>

        <Suspense fallback={<TileListSkeleton />}>
          {tiles.length > 0 ? (
            <TileList tiles={tiles} />
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

function SupplierHeader({ supplier }: { supplier: Supplier }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-md">
      <div className="avatar rounded-full bg-primary text-primary-foreground w-24 h-24 flex items-center justify-center text-6xl font-light uppercase">
        {supplier.name.slice(0, 1)}
      </div>
      <div className="grid gap-xs">
        <div className="flex gap-xs items-baseline">
          <h1 className="text-3xl font-semibold">{supplier.name}</h1>
          <p className="text-muted-foreground">{supplier.handle}</p>
        </div>
        {supplier.description && <p>{supplier.description}</p>}
        <div className="flex flex-wrap gap-xxs col-span-full">
          {supplier.services.map((service) => (
            <Badge variant={'secondary'} key={service}>
              {service}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-xxs col-span-full">
          {supplier.locations.map((location) => (
            <Badge variant={'secondary'} key={location}>
              {location}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

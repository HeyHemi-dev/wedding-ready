import { ExternalLinkIcon, InfoIcon, SquarePlusIcon, StarIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'

import { getCurrentUser } from '@/actions/get-current-user'
import { noTiles } from '@/components/tiles/tile-list'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Section from '@/components/ui/section'
import { SupplierModel } from '@/models/supplier'
import { Supplier } from '@/models/types'
import { valueToPretty } from '@/utils/enum-to-pretty'

import { SupplierTiles } from './supplier-tiles'


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
  // const tiles = await TileModel.getBySupplier(supplier.id, user?.id ?? undefined)

  return (
    <>
      <Section>
        {isSupplierUser && (
          <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
            <InfoIcon size="16" strokeWidth={2} />
            You can edit this page
          </div>
        )}

        <div className="grid grid-cols-[minmax(10rem,theme(spacing.textLength))_auto] gap-md">
          <div className="grid gap-md">
            <SupplierHeader supplier={supplier} />
            <div className="flex gap-sm">
              <Button disabled={!user} variant={'default'} className="gap-xs">
                <StarIcon className="w-4 h-4" />
                Add to Favourites
              </Button>

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

          {isSupplierUser && (
            <div className="flex place-self-end">
              <Link href={`/suppliers/${handle}/new`}>
                <Button variant={'secondary'} className="gap-xs">
                  <SquarePlusIcon className="w-4 h-4" />
                  Create Tiles
                </Button>
              </Link>
            </div>
          )}
        </div>

        <ErrorBoundary fallback={noTiles({ message: 'Error loading tiles', cta: { text: 'Retry', redirect: `/suppliers/${handle}` } })}>
          <SupplierTiles supplier={supplier} user={user ?? undefined} />
        </ErrorBoundary>
      </Section>
    </>
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
          <p className="text-muted-foreground">{`@${supplier.handle}`}</p>
        </div>
        {supplier.description && <p>{supplier.description}</p>}
        <div className="flex flex-wrap gap-xxs col-span-full">
          {supplier.services.map((service) => (
            <Badge variant={'secondary'} key={service}>
              {valueToPretty(service)}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-xxs col-span-full">
          {supplier.locations.map((location) => (
            <Badge variant={'secondary'} key={location}>
              {valueToPretty(location)}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

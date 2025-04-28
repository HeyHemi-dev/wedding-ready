import { ExternalLinkIcon, SquarePlusIcon, StarIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'

import { getCurrentUser } from '@/app/_actions/get-current-user'
import { noTiles } from '@/components/tiles/tile-list'
import { Area } from '@/components/ui/area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { SupplierModel } from '@/models/supplier'
import { Supplier } from '@/models/types'
import { valueToPretty } from '@/utils/enum-helpers'

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

  return (
    <>
      <Section>
        <Area>
          <div className="supplier-header">
            <div className="top-row flex items-center gap-friend">
              <p className="text-muted-foreground">{`@${supplier.handle}`}</p>
              <Button disabled={!user} className="gap-xs">
                <StarIcon className="h-4 w-4" />
                Follow
              </Button>

              {supplier.websiteUrl && (
                <Link href={supplier.websiteUrl} target="_blank">
                  <Button variant={'outline'} className="gap-xs">
                    <ExternalLinkIcon className="h-4 w-4" />
                    Visit Website
                  </Button>
                </Link>
              )}
            </div>
            <SupplierHeader supplier={supplier} />{' '}
          </div>
        </Area>
        {isSupplierUser && (
          <div className="grid place-items-center rounded-full bg-secondary p-xxs">
            <div className="flex place-self-end">
              <Link href={`/suppliers/${handle}/new`}>
                <Button variant={'secondary'} className="gap-xs">
                  <SquarePlusIcon className="h-4 w-4" />
                  Create Tiles
                </Button>
              </Link>
            </div>
          </div>
        )}

        <ErrorBoundary
          fallback={noTiles({
            message: 'Error loading tiles',
            cta: { text: 'Retry', redirect: `/suppliers/${handle}` },
          })}>
          <SupplierTiles supplier={supplier} user={user ?? undefined} />
        </ErrorBoundary>
      </Section>
    </>
  )
}

function SupplierHeader({ supplier }: { supplier: Supplier }) {
  return (
    <>
      <div className="left-column grid place-content-start gap-spouse">
        <div className="flex items-end gap-sibling">
          <div className="avatar flex h-16 w-16 items-center justify-center rounded-full bg-white text-4xl font-light uppercase">
            {supplier.name.slice(0, 1)}
          </div>
          <h1 className="heading-lg">{supplier.name}</h1>
        </div>
        {supplier.description && <p className="prose">{supplier.description}</p>}
      </div>
      <div className="right-column grid gap-friend">
        <div className="grid gap-spouse">
          <h2 className="ui-small-s2">Services Offered</h2>
          <div className="col-span-full flex flex-wrap gap-sibling">
            {supplier.services.map((service) => (
              <Badge key={service}>{valueToPretty(service)}</Badge>
            ))}
          </div>
        </div>
        <div className="grid gap-spouse">
          <h2 className="ui-small-s2">Areas Served</h2>
          <div className="col-span-full flex flex-wrap gap-sibling">
            {supplier.locations.map((location) => (
              <Badge key={location}>{valueToPretty(location)}</Badge>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

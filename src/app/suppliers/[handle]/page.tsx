import { ExternalLinkIcon, SquarePlusIcon, StarIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'

import { getCurrentUser } from '@/src/app/_actions/get-current-user'
import { ActionBar } from '@/components/action-bar/action-bar'
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
      <Section className="min-h-svh-minus-header pt-0">
        <Area>
          <div className="supplier-header">
            <div className="top-row flex items-center gap-friend">
              <Button disabled={!user} className="gap-spouse">
                <StarIcon className="h-4 w-4" />
                {`Follow @${supplier.handle}`}
              </Button>

              {supplier.websiteUrl && (
                <Link href={supplier.websiteUrl} target="_blank">
                  <Button variant={'outline'} className="gap-spouse">
                    <ExternalLinkIcon className="h-4 w-4" />
                    Visit Website
                  </Button>
                </Link>
              )}
            </div>
            <SupplierHeader supplier={supplier} />
          </div>
        </Area>
        {isSupplierUser && (
          <ActionBar className="col-span-full">
            <div className="flex place-self-end">
              <Link href={`/suppliers/${handle}/new`}>
                <Button variant={'secondary'} className="gap-spouse">
                  <SquarePlusIcon className="h-4 w-4" />
                  Create Tiles
                </Button>
              </Link>
            </div>
          </ActionBar>
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
        <h1 className="heading-lg">{supplier.name}</h1>
        {supplier.description && <p className="prose">{supplier.description}</p>}
      </div>
      <div className="right-column grid gap-friend">
        <div className="grid gap-spouse">
          <h2 className="ui-small-s2">Services Offered</h2>
          <div className="col-span-full flex flex-wrap gap-partner">
            {supplier.services.map((service) => (
              <Badge key={service}>{valueToPretty(service)}</Badge>
            ))}
          </div>
        </div>
        <div className="grid gap-spouse">
          <h2 className="ui-small-s2">Areas Served</h2>
          <div className="col-span-full flex flex-wrap gap-partner">
            {supplier.locations.map((location) => (
              <Badge key={location}>{valueToPretty(location)}</Badge>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

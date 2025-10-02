import { ExternalLinkIcon, SquarePlusIcon, StarIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'

import { Supplier } from '@/app/_types/suppliers'
import { ActionBar } from '@/components/action-bar/action-bar'
import { noTiles } from '@/components/tiles/tile-list'
import { Area } from '@/components/ui/area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { supplierOperations } from '@/operations/supplier-operations'
import { valueToPretty } from '@/utils/enum-helpers'
import { locationPretty } from '@/db/location-descriptions'
import { servicePretty } from '@/db/service-descriptions'

import { SupplierTiles } from './supplier-tiles'
import { getAuthUserId } from '@/utils/auth'

export default async function SupplierPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const supplier = await supplierOperations.getByHandle(handle)

  if (!supplier) {
    notFound()
  }

  // Check if the user is the owner of the supplier to enable edit features
  const authUserId = await getAuthUserId()
  const isSupplierUser = supplier?.users.some((u) => u.id === authUserId)

  return (
    <>
      <Section className="min-h-svh-minus-header pt-0">
        <Area>
          <SupplierHeader supplier={supplier} authUserId={authUserId} />
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
          <SupplierTiles supplier={supplier} authUserId={authUserId} />
        </ErrorBoundary>
      </Section>
    </>
  )
}

function SupplierHeader({ supplier, authUserId }: { supplier: Supplier; authUserId: string | null }) {
  return (
    <div className="grid grid-rows-[auto_1fr] gap-friend laptop:grid-cols-[clamp(30ch,66%,var(--width-prose))_1fr]">
      <div className="col-span-full flex flex-wrap items-center gap-friend">
        <Button disabled={!authUserId} className="gap-spouse">
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
      <div className="grid place-content-start gap-spouse">
        <h1 className="heading-lg">{supplier.name}</h1>
        {supplier.description && <p className="ui-small">{supplier.description}</p>}
      </div>
      <div className="grid gap-friend">
        <div className="grid gap-spouse">
          <h2 className="ui-small-s2">Services Offered</h2>
          <div className="col-span-full flex flex-wrap gap-partner">
            {supplier.services.map((service) => (
              <Badge key={service}>{servicePretty[service].value}</Badge>
            ))}
          </div>
        </div>
        <div className="grid gap-spouse">
          <h2 className="ui-small-s2">Areas Served</h2>
          <div className="col-span-full flex flex-wrap gap-partner">
            {supplier.locations.map((location) => (
              <Badge key={location}>{locationPretty[location].value}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

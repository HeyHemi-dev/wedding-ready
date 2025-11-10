import { ExternalLinkIcon, SquarePenIcon, SquarePlusIcon, StarIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'

import { Supplier } from '@/app/_types/suppliers'
import { handleSchema } from '@/app/_types/validation-schema'
import { ActionBar } from '@/components/action-bar/action-bar'
import { noTiles } from '@/components/tiles/tile-list'
import { Area } from '@/components/ui/area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { locationPretty } from '@/db/location-descriptions'
import { servicePretty } from '@/db/service-descriptions'
import { supplierOperations } from '@/operations/supplier-operations'
import { getAuthUserId } from '@/utils/auth'

import { SupplierTiles } from './supplier-tiles'

export default async function SupplierPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const { success, error: parseError } = handleSchema.safeParse(handle)
  if (!success || parseError) return notFound()

  const supplier = await supplierOperations.getByHandle(handle)
  if (!supplier) return notFound()

  // Check if the user is the owner of the supplier to enable edit features
  const authUserId = await getAuthUserId()
  const isSupplierUser = supplier?.users.some((u) => u.id === authUserId)

  return (
    <>
      <Section className="min-h-svh-minus-header pt-0">
        <Area>
          <SupplierHeader supplier={supplier} authUserId={authUserId} isSupplierUser={isSupplierUser} />
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

function SupplierHeader({ supplier, authUserId, isSupplierUser }: { supplier: Supplier; authUserId: string | null; isSupplierUser: boolean }) {
  return (
    <div className="grid grid-rows-[auto_1fr] gap-friend laptop:grid-cols-[clamp(30ch,66%,var(--width-prose))_1fr]">
      <div className="col-span-full flex flex-wrap items-center gap-sibling">
        {isSupplierUser ? (
          <Button disabled={!authUserId} className="gap-spouse" asChild>
            <Link href={`/account/manage-suppliers/${supplier.handle}`}>
              <SquarePenIcon className="h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        ) : (
          <Button disabled={!authUserId} className="gap-spouse">
            <StarIcon className="h-4 w-4" />
            {`Follow @${supplier.handle}`}
          </Button>
        )}

        {supplier.websiteUrl && (
          <Button variant={'outline'} className="gap-spouse" asChild>
            <Link href={supplier.websiteUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLinkIcon className="h-4 w-4" />
              Visit Website
            </Link>
          </Button>
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
              <Link key={service} href={`/services/${service}`} passHref>
                <Badge>{servicePretty[service].value}</Badge>
              </Link>
            ))}
          </div>
        </div>
        <div className="grid gap-spouse">
          <h2 className="ui-small-s2">Areas Served</h2>
          <div className="col-span-full flex flex-wrap gap-partner">
            {supplier.locations.map((location) => (
              <Link key={location} href={`/locations/${location}`} passHref>
                <Badge>{locationPretty[location].value}</Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

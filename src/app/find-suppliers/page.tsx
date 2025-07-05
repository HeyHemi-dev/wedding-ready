import { unstable_cache } from 'next/cache'
import Link from 'next/link'

import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'
import { Location, Service } from '@/db/constants'
import { locationOperations } from '@/operations/location-operations'
import { serviceOperations } from '@/operations/service-operations'
import { enumKeyToParam, enumToPretty } from '@/utils/enum-helpers'

import { tags } from '@/app/_types/tags'
import { locationHelpers } from '@/utils/const-helpers'

const locationTags = locationHelpers.toPretty().map((location) => tags.locationSuppliers(location.key))
const getCachedLocations = unstable_cache(locationOperations.getAllWithSupplierCount, locationTags)

const serviceTags = enumToPretty(Service).map((service) => tags.serviceSuppliers(service.key))
const getCachedServices = unstable_cache(serviceOperations.getAllWithSupplierCount, serviceTags)

export default async function FindSuppliers() {
  const [locations, services] = await Promise.all([getCachedLocations(), getCachedServices()])

  return (
    <>
      <Section className="min-h-svh-minus-header pt-0">
        <div className="grid gap-area">
          <Area className="bg-transparent">
            <h1 className="heading-xl">Find Suppliers</h1>
          </Area>
          <Area>
            <div className="grid gap-friend">
              <h2 className="ui-s1">Explore suppliers by location</h2>
              <ul className="columns-2 gap-acquaintance laptop:columns-3">
                {locations.map((location) => (
                  <li key={location.key} className="py-xs">
                    <FindSuppliersItem label={location.value} href={`/locations/${enumKeyToParam(location.key)}`} supplierCount={location.supplierCount} />
                  </li>
                ))}
              </ul>
            </div>
          </Area>
          <Area>
            <div className="grid gap-friend">
              <h2 className="ui-s1">Explore suppliers by service category</h2>
              <ul className="columns-2 gap-acquaintance laptop:columns-3">
                {services.map((service) => (
                  <li key={service.key} className="py-xs">
                    <FindSuppliersItem label={service.value} href={`/services/${enumKeyToParam(service.key)}`} supplierCount={service.supplierCount} />
                  </li>
                ))}
              </ul>
            </div>
          </Area>
        </div>
      </Section>
    </>
  )
}

const formatSupplierCount = (count: number): string => {
  if (count === 0) return ''
  if (count > 10) return count.toString()
  return `0${count}`
}

type FindSuppliersItemProps = {
  label: string
  href: string
  supplierCount: number
}

function FindSuppliersItem({ label, href, supplierCount }: FindSuppliersItemProps) {
  const formattedSupplierCount = formatSupplierCount(supplierCount)

  return (
    <Link href={href} className="grid items-start gap-x-partner tablet:grid-cols-[auto_1fr]">
      <h3 className="row-start-2 text-lg tablet:row-start-1">{label}</h3>
      <span className="ui-small row-start-1 text-muted-foreground">{formattedSupplierCount}</span>
    </Link>
  )
}

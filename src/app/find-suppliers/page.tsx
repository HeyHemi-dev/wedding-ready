import Link from 'next/link'

import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'
import { Location, Service } from '@/db/constants'
import { enumKeyToParam, enumToPretty } from '@/utils/enum-helpers'
import { locationOperations } from '@/operations/location-operations'
import { unstable_cache } from 'next/cache'
import { tags } from '../_types/tags'
import { serviceOperations } from '@/operations/service-operations'

const locationTags = enumToPretty(Location).map((location) => tags.locationSuppliers(location.key))
const getCachedLocations = unstable_cache(locationOperations.getAllWithSupplierCount, locationTags)

const serviceTags = enumToPretty(Service).map((service) => tags.serviceSuppliers(service.key))
const getCachedServices = unstable_cache(serviceOperations.getAllWithSupplierCount, serviceTags)

export default async function FindSuppliers() {
  const locations = await getCachedLocations()
  const services = await getCachedServices()

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
              <ul className="columns-2 gap-acquaintance md:columns-3">
                {locations.map((location) => (
                  <FindSuppliersItem
                    key={location.key}
                    label={location.value}
                    href={`/locations/${enumKeyToParam(location.key)}`}
                    supplierCount={location.supplierCount}
                  />
                ))}
              </ul>
            </div>
          </Area>
          <Area>
            <div className="grid gap-friend">
              <h2 className="ui-s1">Explore suppliers by service category</h2>
              <ul className="columns-2 gap-acquaintance md:columns-3">
                {services.map((service) => (
                  <FindSuppliersItem
                    key={service.key}
                    label={service.value}
                    href={`/services/${enumKeyToParam(service.key)}`}
                    supplierCount={service.supplierCount}
                  />
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
    <li className="py-xs">
      <Link href={href} className="grid items-start gap-x-partner md:grid-cols-[auto_1fr]">
        <h3 className="row-start-2 text-lg md:row-start-1">{label}</h3>
        <span className="ui-small row-start-1 text-muted-foreground">{formattedSupplierCount}</span>
      </Link>
    </li>
  )
}

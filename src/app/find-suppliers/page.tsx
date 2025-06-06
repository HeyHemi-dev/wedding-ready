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

// const serviceTags = enumToPretty(Service).map((service) => tags.serviceSuppliers(service.key))
// const getCachedServices = unstable_cache(serviceOperations.getAllWithSupplierCount, serviceTags)

export default async function FindSuppliers() {
  // TODO: cache this value

  const locations = await getCachedLocations()
  console.log(locations)

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
              <ul className="columns-3 gap-acquaintance">
                {locations.map((location) => (
                  <FindSuppliersItem key={location.enumKey} {...location} />
                ))}
              </ul>
            </div>
          </Area>
          <Area>
            <div className="grid gap-friend">
              <h2 className="ui-s1">Explore suppliers by service category</h2>
              <ul className="columns-3 gap-acquaintance">
                {enumToPretty(Service).map((service) => {
                  const serviceParam = enumKeyToParam(service.key)

                  return (
                    <li key={service.key} className="py-xs">
                      <Link href={`/services/${serviceParam}`} className="inline-flex items-baseline gap-spouse">
                        <h3 className="text-lg">{service.label}</h3> <span className="ui-small text-muted-foreground">{`(?)`}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </Area>
        </div>
      </Section>
    </>
  )
}

function FindSuppliersItem({ type, enumKey, enumValue, supplierCount }: FindSuppliersItem) {
  const href = type === 'location' ? `/locations/${enumKeyToParam(enumKey)}` : `/services/${enumKeyToParam(enumKey)}`

  return (
    <li className="py-xs">
      <Link href={href} className="inline-flex items-baseline gap-spouse">
        <h3 className="text-lg">{enumValue}</h3>
        <span className="ui-small text-muted-foreground">{supplierCount}</span>
      </Link>
    </li>
  )
}

import Link from 'next/link'

import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'
import { Location, Service } from '@/db/constants'
import { enumKeyToParam, enumToPretty } from '@/utils/enum-helpers'

export default function FindSuppliers() {
  return (
    <>
      <Section className="min-h-svh-minus-header">
        <h1 className="font-serif text-4xl">Find Suppliers</h1>
        <Area>
          <div className="flex flex-col gap-md">
            <div className="flex flex-col gap-xs">
              <h2 className="font-semibold">Explore suppliers by location</h2>
            </div>
            <ul className="columns-3 gap-md">
              {enumToPretty(Location).map((location) => {
                const locationParam = enumKeyToParam(location.key)

                return (
                  <li key={location.key} className="py-xs">
                    <h2 className="text-lg">
                      <Link href={`/locations/${locationParam}`}>{location.label}</Link>
                    </h2>
                  </li>
                )
              })}
            </ul>
          </div>
        </Area>
        <Area>
          <div className="flex flex-col gap-md">
            <div className="flex flex-col gap-xs">
              <h2 className="font-semibold">Explore suppliers by service category</h2>
            </div>
            <ul className="columns-3 gap-md">
              {enumToPretty(Service).map((service) => {
                const serviceParam = enumKeyToParam(service.key)

                return (
                  <li key={service.key} className="py-xs">
                    <h2 className="text-lg">
                      <Link href={`/services/${serviceParam}`}>{service.label}</Link>
                    </h2>
                  </li>
                )
              })}
            </ul>
          </div>
        </Area>
      </Section>
    </>
  )
}

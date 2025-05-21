import Link from 'next/link'

import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'
import { Location, Service } from '@/src/db/constants'
import { enumKeyToParam, enumToPretty } from '@/utils/enum-helpers'

export default function FindSuppliers() {
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
                {enumToPretty(Location).map((location) => {
                  const locationParam = enumKeyToParam(location.key)

                  return (
                    <li key={location.key} className="py-xs">
                      <Link href={`/locations/${locationParam}`} className="inline-flex items-baseline gap-spouse">
                        <h3 className="text-lg">{location.label}</h3>
                        <span className="ui-small text-muted-foreground">{`(?)`}</span>
                      </Link>
                    </li>
                  )
                })}
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

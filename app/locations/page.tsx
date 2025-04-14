import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'
import { Location } from '@/db/constants'
import { enumKeyToParam, enumToPretty } from '@/utils/enum-helpers'
import Link from 'next/link'

export default function LocationsPage() {
  return (
    <Section className="min-h-svh-minus-header">
      <Area>
        <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-serif text-4xl">Locations</h1>
            <p className="text-muted-foreground">Explore suppliers by location.</p>
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
    </Section>
  )
}

import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'
import { Location } from '@/db/constants'
import { enumToPretty } from '@/utils/enum-to-pretty'
import Link from 'next/link'

export default function LocationsPage() {
  return (
    <Section>
      <Area>
        <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-serif text-4xl">Locations</h1>
            <p className="text-muted-foreground">View suppliers by location.</p>
          </div>
          <div className="columns-3 gap-md">
            {enumToPretty(Location).map((location) => (
              <div key={location.value}>
                <Link href={`/locations/${location.value.toLowerCase()}`}>
                  <h2 className="py-xs text-lg">{location.label}</h2>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </Area>
    </Section>
  )
}

import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'
import { Location } from '@/db/constants'
import { notFound } from 'next/navigation'

function normalizeLocationParam(param: string): keyof typeof Location {
  // Convert "bay-of-plenty" or "bay_of_plenty" to "BAY_OF_PLENTY"
  const normalized = param.replace(/-/g, '_').toUpperCase()
  if (!(normalized in Location)) {
    notFound()
  }
  return normalized as keyof typeof Location
}

export default function LocationPage({ params }: { params: { location: string } }) {
  const locationKey = params.location.toUpperCase() as keyof typeof Location
  const location = Location[locationKey]

  return (
    <Section>
      <Area>
        <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-serif text-4xl">{location}</h1>
          </div>
        </div>
      </Area>
    </Section>
  )
}

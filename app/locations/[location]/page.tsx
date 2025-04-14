import { SuppliersList } from '@/components/suppliers/suppliers-list'
import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'
import { Location } from '@/db/constants'
import { SupplierModel } from '@/models/supplier'
import { paramToEnumKey, valueToPretty } from '@/utils/enum-helpers'
import { notFound } from 'next/navigation'

export default async function LocationPage({ params }: { params: Promise<{ location: string }> }) {
  const locationKey = paramToEnumKey((await params).location, Location)
  const location = Location[locationKey]

  if (!location) {
    notFound()
  }

  const suppliers = await SupplierModel.getAll({ location })

  return (
    <Section>
      <Area>
        <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-serif text-4xl">{valueToPretty(location)}</h1>
          </div>
          <SuppliersList suppliers={suppliers} />
        </div>
      </Area>
    </Section>
  )
}

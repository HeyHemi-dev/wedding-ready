import { notFound } from 'next/navigation'

import { SuppliersGrid, SupplierCard } from '@/components/suppliers/suppliers-list'
import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'
import { locationDescriptions } from '@/db/location-descriptions'
import { supplierModel } from '@/models/supplier'
import { locationHelpers, valueToPretty } from '@/utils/const-helpers'
import { locationOperations } from '@/operations/location-operations'
import { supplierOperations } from '@/operations/supplier-operations'
import { unstable_cache } from 'next/cache'

export default async function LocationPage({ params }: { params: Promise<{ location: string }> }) {
  const location = locationHelpers.paramToConst((await params).location)

  if (!location) {
    notFound()
  }

  const loactionData = locationOperations.getForPage(location)

  const suppliers = await unstable_cache(() => supplierOperations.getListForLocation(location), ['supplier-list', location], { revalidate: 60 * 60 * 24 })()

  return (
    <Section className="min-h-svh-minus-header pt-0">
      <div className="grid grid-rows-[auto_1fr] gap-area">
        <Area className="bg-transparent">
          <div className="flex max-w-prose flex-col gap-partner">
            <h1 className="heading-xl">{loactionData.title}</h1>
            <p className="ui-small text-muted-foreground">{loactionData.description}</p>
          </div>
        </Area>
        <Area>
          <div className="flex flex-col gap-acquaintance">
            <SuppliersGrid>
              {suppliers.map((supplier) => (
                <SupplierCard
                  key={supplier.id}
                  href={`/suppliers/${supplier.handle}`}
                  mainImage={supplier.mainImage}
                  thumbnailImages={supplier.thumbnailImages}
                  name={supplier.name}
                  subtitle={supplier.services.map((service) => valueToPretty(service)).join(', ')}
                  stat={150}
                />
              ))}
            </SuppliersGrid>
          </div>
        </Area>
      </div>
    </Section>
  )
}

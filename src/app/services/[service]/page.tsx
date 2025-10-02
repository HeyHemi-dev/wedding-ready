import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'

import { SuppliersGrid, SupplierCard } from '@/components/suppliers/suppliers-list'
import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'
import { locationPretty } from '@/db/location-descriptions'
import { serviceOperations } from '@/operations/service-operations'
import { supplierOperations } from '@/operations/supplier-operations'
import { serviceHelpers } from '@/utils/const-helpers'

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const service = serviceHelpers.paramToConst((await params).service)

  if (!service) {
    notFound()
  }

  const serviceData = serviceOperations.getForPage(service)

  const suppliers = await unstable_cache(() => supplierOperations.getListForSupplierGrid({ service }), ['supplier-list', service], {
    revalidate: 60 * 60 * 24,
  })()

  return (
    <Section className="min-h-svh-minus-header pt-0">
      <div className="grid grid-rows-[auto_1fr] gap-area">
        <Area className="bg-transparent">
          <div className="flex max-w-prose flex-col gap-partner">
            <h1 className="heading-xl">{serviceData.title}</h1>
            <p className="text-muted-foreground">{serviceData.description}</p>
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
                  subtitle={supplier.locations.map((location) => locationPretty[location].value).join(', ')}
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

import { notFound } from 'next/navigation'

import { SuppliersGrid, SupplierCard } from '@/components/suppliers/suppliers-list'
import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'
import { serviceDescriptions } from '@/db/service-descriptions'

import { serviceHelpers, valueToPretty } from '@/utils/const-helpers'
import { serviceOperations } from '@/operations/service-operations'
import { unstable_cache } from 'next/cache'
import { supplierOperations } from '@/operations/supplier-operations'

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
                  mainImage={'https://images.unsplash.com/photo-1606216794074-735e91aa2c92'}
                  thumbnailImages={[
                    'https://images.unsplash.com/photo-1649615644622-6d83f48e69c5',
                    'https://images.unsplash.com/photo-1665607437981-973dcd6a22bb',
                  ]}
                  name={supplier.name}
                  subtitle={supplier.locations.map((location) => valueToPretty(location)).join(', ')}
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

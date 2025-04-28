import { notFound } from 'next/navigation'

import { SuppliersGrid, SupplierCard } from '@/components/suppliers/suppliers-list'
import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'
import { Service } from '@/db/constants'
import { SupplierModel } from '@/models/supplier'
import { paramToEnumKey, valueToPretty } from '@/utils/enum-helpers'

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const serviceKey = paramToEnumKey((await params).service, Service)
  const service = Service[serviceKey]

  if (!service) {
    notFound()
  }

  const suppliers = await SupplierModel.getAll({ service })

  return (
    <Section>
      <Area>
        <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-serif text-4xl">{valueToPretty(service)}</h1>
          </div>
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
    </Section>
  )
}

import { notFound } from 'next/navigation'

import { SuppliersGrid, SupplierCard } from '@/components/suppliers/suppliers-list'
import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'
import { locationDescriptions } from '@/db/location-descriptions'
import { SupplierModel } from '@/models/supplier'
import { locationHelpers, valueToPretty } from '@/utils/const-helpers'

export default async function LocationPage({ params }: { params: Promise<{ location: string }> }) {
  const location = locationHelpers.paramToConst((await params).location)

  if (!location) {
    notFound()
  }

  const suppliers = await SupplierModel.getAll({ location })

  return (
    <Section className="min-h-svh-minus-header pt-0">
      <div className="grid grid-rows-[auto_1fr] gap-area">
        <Area className="bg-transparent">
          <div className="flex max-w-prose flex-col gap-partner">
            <h1 className="heading-xl">{locationDescriptions[location].title}</h1>
            <p className="text-muted-foreground">{locationDescriptions[location].description}</p>
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

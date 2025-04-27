import { SupplierCard, SuppliersGrid } from '@/components/suppliers/suppliers-list'
import { Section } from '@/components/ui/section'
import { SupplierModel } from '@/models/supplier'
import { valueToPretty } from '@/utils/enum-helpers'

export default async function SuppliersPage() {
  const suppliers = await SupplierModel.getAll()

  return (
    <Section>
      <h1 className="text-2xl font-bold">Suppliers</h1>

      <SuppliersGrid>
        {suppliers.map((supplier) => (
          <SupplierCard
            key={supplier.id}
            href={`/suppliers/${supplier.handle}`}
            mainImage={'https://images.unsplash.com/photo-1606216794074-735e91aa2c92'}
            thumbnailImages={['https://images.unsplash.com/photo-1649615644622-6d83f48e69c5', 'https://images.unsplash.com/photo-1665607437981-973dcd6a22bb']}
            name={supplier.name}
            subtitle={supplier.locations.map((location) => valueToPretty(location)).join(', ')}
            stat={150}
          />
        ))}
      </SuppliersGrid>
    </Section>
  )
}

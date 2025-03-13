import Section from '@/components/ui/section'
import { SupplierModel } from '@/models/supplier'
import { SupplierWithDetail } from '@/models/types'
import Link from 'next/link'

export default async function SuppliersPage() {
  const suppliers = await SupplierModel.getAll()

  return (
    <Section>
      <h1 className="text-2xl font-bold">Suppliers</h1>
      <div className="grid grid-cols-3 gap-4">
        {suppliers.map((supplier) => (
          <SupplierCard key={supplier.id} supplier={supplier} />
        ))}
      </div>
    </Section>
  )
}

function SupplierCard({ supplier }: { supplier: SupplierWithDetail }) {
  return (
    <div className="border border-border rounded-lg p-4">
      <h2 className="text-lg font-bold">{supplier.name}</h2>
      <p className="text-sm text-muted-foreground">{supplier.description}</p>
      <Link href={`/suppliers/${supplier.handle}`} className="text-sm text-muted-foreground">
        View supplier
      </Link>
    </div>
  )
}

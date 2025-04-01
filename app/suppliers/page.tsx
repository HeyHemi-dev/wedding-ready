import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Section from '@/components/ui/section'
import { SupplierModel } from '@/models/supplier'
import { Supplier } from '@/models/types'
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

function SupplierCard({ supplier }: { supplier: Supplier }) {
  return (
    <Card>
      <Link href={`/suppliers/${supplier.handle}`}>
        <CardHeader>
          <CardTitle>{supplier.name}</CardTitle>
          <CardDescription>{supplier.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">View supplier</p>
        </CardContent>
      </Link>
    </Card>
  )
}

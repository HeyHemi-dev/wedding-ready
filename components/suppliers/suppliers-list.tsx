import { Supplier } from '@/models/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export function SuppliersList({ suppliers }: { suppliers: Supplier[] }) {
  return (
    <div className="grid grid-cols-1 gap-md md:grid-cols-2 lg:grid-cols-3">
      {suppliers.map((supplier) => (
        <SupplierCard key={supplier.id} supplier={supplier} />
      ))}
    </div>
  )
}

export function SupplierCard({ supplier }: { supplier: Supplier }) {
  return (
    <Link href={`/suppliers/${supplier.handle}`} passHref>
      <Card>
        <CardHeader>
          <CardTitle>{supplier.name}</CardTitle>
          <CardDescription>{supplier.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">View supplier</p>
        </CardContent>
      </Card>
    </Link>
  )
}

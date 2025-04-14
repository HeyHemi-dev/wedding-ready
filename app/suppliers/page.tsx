import { SuppliersList } from '@/components/suppliers/suppliers-list'
import { Section } from '@/components/ui/section'
import { SupplierModel } from '@/models/supplier'


export default async function SuppliersPage() {
  const suppliers = await SupplierModel.getAll()

  return (
    <Section>
      <h1 className="text-2xl font-bold">Suppliers</h1>
      <SuppliersList suppliers={suppliers} />
    </Section>
  )
}

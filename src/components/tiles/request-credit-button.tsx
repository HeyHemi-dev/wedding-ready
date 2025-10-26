import { Button } from '@/components/ui/button'
import { Supplier, SupplierSearchResult } from '@/app/_types/suppliers'
import { Plus } from 'lucide-react'

interface RequestCreditButtonProps {
  tileId: string
  userSuppliers: SupplierSearchResult[]
}

export function RequestCreditButton({ tileId, userSuppliers }: RequestCreditButtonProps) {
  return (
    <Button variant="ghost" size="sm" className="flex items-center gap-spouse">
      <Plus className="h-4 w-4" />
      <span>Request credit</span>
    </Button>
  )
}

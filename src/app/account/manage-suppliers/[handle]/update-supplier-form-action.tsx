'use server'

import { SupplierUpdateForm } from '@/app/_types/validation-schema'

export async function updateSupplierFormAction(supplierId: string, data: SupplierUpdateForm, submittedBy: string): Promise<SupplierUpdateForm> {
  console.log('updateSupplierFormAction', data)
  return data
}

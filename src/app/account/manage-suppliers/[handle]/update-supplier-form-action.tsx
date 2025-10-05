'use server'

import { OPERATION_ERROR } from '@/app/_types/errors'
import { SupplierUpdateForm, supplierUpdateFormSchema } from '@/app/_types/validation-schema'
import { supplierOperations } from '@/operations/supplier-operations'
import { getAuthUserId } from '@/utils/auth'

export async function updateSupplierFormAction(supplierId: string, data: SupplierUpdateForm, submittedBy: string): Promise<SupplierUpdateForm> {
  const authUserId = await getAuthUserId()
  if (!authUserId || submittedBy !== authUserId) throw OPERATION_ERROR.NOT_AUTHENTICATED()

  const { success, error, data: validatedData } = supplierUpdateFormSchema.safeParse(data)
  if (!success || error) throw OPERATION_ERROR.VALIDATION_ERROR()

  const updatedSupplier = await supplierOperations.updateProfile(supplierId, validatedData, authUserId)

  return updatedSupplier
}

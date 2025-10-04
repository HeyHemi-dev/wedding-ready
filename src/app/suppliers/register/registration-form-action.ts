'use server'

import { OPERATION_ERROR } from '@/app/_types/errors'
import { SupplierRegistrationForm, supplierRegistrationFormSchema } from '@/app/_types/validation-schema'
import { supplierOperations } from '@/operations/supplier-operations'
import { getAuthUserId } from '@/utils/auth'

export async function registrationFormAction(data: SupplierRegistrationForm, submittedBy: string): Promise<{ handle: string }> {
  const { success, error, data: validatedData } = supplierRegistrationFormSchema.safeParse(data)
  if (!success || error) {
    throw OPERATION_ERROR.VALIDATION_ERROR()
  }

  const authUserId = await getAuthUserId()
  if (!authUserId || submittedBy !== authUserId) {
    throw OPERATION_ERROR.NOT_AUTHENTICATED()
  }

  const supplier = await supplierOperations.register(validatedData, authUserId)

  return { handle: supplier.handle }
}

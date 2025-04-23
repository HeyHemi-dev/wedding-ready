'use server'

import { supplierActions } from '@/app/_actions/supplier-actions'
import { SupplierRegistrationForm, supplierRegistrationFormSchema } from '@/app/_types/validation-schema'
import { SupplierModel } from '@/models/supplier'
import { getAuthUserIdForAction } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

export async function registrationFormAction({ data }: { data: SupplierRegistrationForm }): Promise<{ handle: string }> {
  const { success, error, data: validatedData } = supplierRegistrationFormSchema.safeParse(data)
  if (!success || error) {
    throw new Error(JSON.stringify(error?.flatten().fieldErrors))
  }

  const { data: authUserId, error: authUserIdError } = await tryCatch(getAuthUserIdForAction())
  if (authUserIdError || !authUserId || validatedData.createdByUserId !== authUserId) {
    throw new Error('Unauthorized')
  }

  const { data: isAvailable, error: isAvailableError } = await tryCatch(SupplierModel.isHandleAvailable({ handle: validatedData.handle }))
  if (isAvailableError || !isAvailable) {
    throw new Error(isAvailableError?.message || 'Handle is already taken')
  }

  const { data: supplier, error: supplierError } = await tryCatch(supplierActions.register({ supplierRegistrationFormData: validatedData }))

  if (supplierError || !supplier) {
    throw new Error(supplierError?.message || 'Failed to register supplier')
  }

  return { handle: supplier.handle }
}

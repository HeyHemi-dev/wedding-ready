'use server'

import { supplierActions } from '@/operations/supplier-actions'
import { SupplierRegistrationForm, supplierRegistrationFormSchema } from '@/app/_types/validation-schema'
import { getAuthUserIdFromSupabase } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

export async function registrationFormAction({ data }: { data: SupplierRegistrationForm }): Promise<{ handle: string }> {
  const { success, error, data: validatedData } = supplierRegistrationFormSchema.safeParse(data)
  if (!success || error) {
    throw new Error(JSON.stringify(error?.flatten().fieldErrors))
  }

  const { data: authUserId, error: authUserIdError } = await tryCatch(getAuthUserIdFromSupabase())
  if (authUserIdError || !authUserId || validatedData.createdByUserId !== authUserId) {
    throw new Error('Unauthorized')
  }

  const { data: supplier, error: supplierError } = await tryCatch(supplierActions.register(validatedData))

  if (supplierError || !supplier) {
    throw new Error(supplierError?.message || 'Failed to register supplier')
  }

  return { handle: supplier.handle }
}

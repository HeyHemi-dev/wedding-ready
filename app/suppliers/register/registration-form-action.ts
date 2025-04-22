'use server'

import { redirect } from 'next/navigation'

import { SupplierRegistrationForm, supplierRegistrationFormSchema } from '@/app/_types/validation-schema'
import { supplierActions } from '@/app/_actions/supplier-actions'
import { getAuthenticatedUserId } from '@/utils/auth'

export async function registrationFormAction({ data }: { data: SupplierRegistrationForm }) {
  const { success, error, data: validatedData } = supplierRegistrationFormSchema.safeParse(data)
  if (!success || error) {
    return { error: error?.flatten().fieldErrors }
  }

  const authUserId = await getAuthenticatedUserId()
  if (!authUserId || validatedData.createdByUserId !== authUserId) {
    return { error: 'Unauthorized' }
  }

  const supplier = await supplierActions.register({ supplierRegistrationFormData: validatedData, createdByUserId: authUserId })

  redirect(`/supplier/${supplier.handle}`)
}

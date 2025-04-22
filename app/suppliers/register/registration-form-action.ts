'use server'

import { redirect } from 'next/navigation'

import { SupplierRegistrationForm, supplierRegistrationFormSchema } from '@/app/_types/validation-schema'
import { supplierActions } from '@/app/_actions/supplier-actions'
import { getAuthUserIdForAction } from '@/utils/auth'

// Form Action takes the request server-side
// Handles validation, authentication, before handing off to the action
// Also handles redirection, toasts etc.
export async function registrationFormAction({ data }: { data: SupplierRegistrationForm }) {
  const { success, error, data: validatedData } = supplierRegistrationFormSchema.safeParse(data)
  if (!success || error) {
    return { error: error?.flatten().fieldErrors }
  }

  const authUserId = await getAuthUserIdForAction()
  if (!authUserId || validatedData.createdByUserId !== authUserId) {
    return { error: 'Unauthorized' }
  }

  console.log('registrationFormAction', validatedData)

  const supplier = await supplierActions.register({ supplierRegistrationFormData: validatedData })

  redirect(`/suppliers/${supplier.handle}`)
}

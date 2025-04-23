import { SupplierModel } from '@/models/supplier'
import { InsertSupplierRaw, SupplierWithUsers } from '@/models/types'
import { UserDetailModel } from '@/models/user'

import { SupplierRegistrationForm } from '../_types/validation-schema'

export const supplierActions = {
  register,
}

async function register({ supplierRegistrationFormData }: { supplierRegistrationFormData: SupplierRegistrationForm }): Promise<SupplierWithUsers> {
  const insertSupplierData: InsertSupplierRaw = {
    name: supplierRegistrationFormData.name,
    handle: supplierRegistrationFormData.handle,
    createdByUserId: supplierRegistrationFormData.createdByUserId,
    description: supplierRegistrationFormData.description,
    websiteUrl: supplierRegistrationFormData.websiteUrl,
  }

  const user = await UserDetailModel.getById(supplierRegistrationFormData.createdByUserId)
  if (!user) {
    throw new Error('User not found')
  }

  return SupplierModel.create(user, insertSupplierData, supplierRegistrationFormData.services, supplierRegistrationFormData.locations)
}

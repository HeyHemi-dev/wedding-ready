import { SupplierRegistrationForm } from '../_types/validation-schema'
import { InsertSupplierRaw, SupplierWithUsers, UserDetailRaw } from '@/models/types'
import { SupplierModel } from '@/models/supplier'
import { UserDetailModel } from '@/models/user'

export const supplierActions = {
  register,
}

async function register({
  supplierRegistrationFormData,
  createdByUserId,
}: {
  supplierRegistrationFormData: SupplierRegistrationForm
  createdByUserId: string
}): Promise<SupplierWithUsers> {
  const insertSupplierData: InsertSupplierRaw = {
    name: supplierRegistrationFormData.name,
    handle: supplierRegistrationFormData.handle,
    createdByUserId,
    description: supplierRegistrationFormData.description,
    websiteUrl: supplierRegistrationFormData.websiteUrl,
  }

  const user = await UserDetailModel.getById(createdByUserId)
  if (!user) {
    throw new Error('User not found')
  }

  return SupplierModel.create(user, insertSupplierData, supplierRegistrationFormData.services, supplierRegistrationFormData.locations)
}

import { db } from '@/db/db'
import { SupplierRegistrationForm } from '../_types/validation-schema'
import { InsertSupplierRaw, SupplierWithUsers, UserDetailRaw } from '@/models/types'
import { SupplierModel } from '@/models/supplier'

export const supplierActions = {
  register,
}

async function register({
  supplierRegistrationFormData,
  user,
}: {
  supplierRegistrationFormData: SupplierRegistrationForm
  user: UserDetailRaw
}): Promise<SupplierWithUsers> {
  const insertSupplierData: InsertSupplierRaw = {
    name: supplierRegistrationFormData.name,
    handle: supplierRegistrationFormData.handle,
    createdByUserId: user.id,
    description: supplierRegistrationFormData.description,
    websiteUrl: supplierRegistrationFormData.websiteUrl,
  }

  return SupplierModel.create(user, insertSupplierData, supplierRegistrationFormData.services, supplierRegistrationFormData.locations)
}

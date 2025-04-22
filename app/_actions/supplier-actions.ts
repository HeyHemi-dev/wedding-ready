import { SupplierRegistrationForm } from '../_types/validation-schema'
import { InsertSupplierRaw, SupplierWithUsers, UserDetailRaw } from '@/models/types'
import { SupplierModel } from '@/models/supplier'
import { UserDetailModel } from '@/models/user'
import { Location, Service } from '@/db/constants'

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

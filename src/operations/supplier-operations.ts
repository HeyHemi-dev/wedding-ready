import { SupplierRegistrationForm } from '@/app/_types/validation-schema'
import { SupplierModel } from '@/models/supplier'
import { InsertSupplierRaw, SupplierWithUsers } from '@/models/types'
import { UserDetailModel } from '@/models/user'

export const supplierOperations = {
  register,
}

async function register({ name, handle, websiteUrl, description, services, locations, createdByUserId }: SupplierRegistrationForm): Promise<SupplierWithUsers> {
  const user = await UserDetailModel.getById(createdByUserId)
  if (!user) {
    throw new Error('User not found')
  }

  const isAvailable = await SupplierModel.isHandleAvailable({ handle })
  if (!isAvailable) {
    throw new Error('Handle is already taken')
  }

  const insertSupplierData: InsertSupplierRaw = {
    name,
    handle,
    createdByUserId,
    description,
    websiteUrl,
  }

  return SupplierModel.create(user, insertSupplierData, services, locations)
}

import { OPERATION_ERROR } from '@/app/_types/errors'
import { User } from '@/app/_types/users'
import { UserUpdateForm } from '@/app/_types/validation-schema'
import { supplierModel } from '@/models/supplier'
import { supplierUsersModel } from '@/models/supplier-user'
import * as t from '@/models/types'
import { userProfileModel } from '@/models/user'
import { emptyStringToNullIfAllowed } from '@/utils/empty-strings'

export const userOperations = {
  getById,
  getByHandle,
  updateProfile,
}

async function getById(id: string): Promise<User> {
  const user = await userProfileModel.getRawById(id)
  if (!user) throw OPERATION_ERROR.RESOURCE_NOT_FOUND()

  const userSuppliers = await supplierUsersModel.getForUserId(user.id)
  const suppliers = await Promise.all(userSuppliers.map((su) => supplierModel.getRawById(su.supplierId)))
  const userSuppliersMap = new Map(userSuppliers.map((su) => [su.supplierId, su]))

  return {
    id: user.id,
    handle: user.handle,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    instagramUrl: user.instagramUrl,
    tiktokUrl: user.tiktokUrl,
    websiteUrl: user.websiteUrl,
    suppliers: suppliers.map((s) => {
      if (!s) throw OPERATION_ERROR.RESOURCE_NOT_FOUND()
      return {
        id: s.id,
        name: s.name,
        handle: s.handle,
        role: userSuppliersMap.get(s.id)!.role,
      }
    }),
  }
}

async function getByHandle(handle: string): Promise<User | null> {
  // Getting by handle provides a more graceful fallback if the user is not found to support searching and other user input.
  const user = await userProfileModel.getRawByHandle(handle)
  if (!user) return null

  const userSuppliers = await supplierUsersModel.getForUserId(user.id)
  const suppliers = await Promise.all(userSuppliers.map((su) => supplierModel.getRawById(su.supplierId)))
  const userSuppliersMap = new Map(userSuppliers.map((su) => [su.supplierId, su]))

  return {
    id: user.id,
    handle: user.handle,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    instagramUrl: user.instagramUrl,
    tiktokUrl: user.tiktokUrl,
    websiteUrl: user.websiteUrl,
    suppliers: suppliers.map((s) => {
      if (!s) throw OPERATION_ERROR.RESOURCE_NOT_FOUND()
      return {
        id: s.id,
        name: s.name,
        handle: s.handle,
        role: userSuppliersMap.get(s.id)!.role,
      }
    }),
  }
}

async function updateProfile(data: UserUpdateForm, authUserId: string): Promise<t.UserProfileRaw> {
  const user = await userProfileModel.getRawById(data.id)
  if (!user) throw OPERATION_ERROR.RESOURCE_NOT_FOUND()

  if (user.id !== authUserId) throw OPERATION_ERROR.FORBIDDEN()

  const setUserDetailData: t.SetUserProfileRaw = emptyStringToNullIfAllowed({
    displayName: data.displayName,
    bio: data.bio,
    avatarUrl: data.avatarUrl,
    instagramUrl: data.instagramUrl,
    tiktokUrl: data.tiktokUrl,
    websiteUrl: data.websiteUrl,
  })

  return userProfileModel.updateRaw(user.id, setUserDetailData)
}

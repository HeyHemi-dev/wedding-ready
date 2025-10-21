import { OPERATION_ERROR } from '@/app/_types/errors'
import { User } from '@/app/_types/users'
import { UserUpdateForm } from '@/app/_types/validation-schema'
import { supplierModel } from '@/models/supplier'
import { supplierUsersModel } from '@/models/supplier-user'
import { SetUserDetailRaw, UserDetailRaw } from '@/models/types'
import { UserDetailModel } from '@/models/user'
import { emptyStringToNullIfAllowed } from '@/utils/empty-strings'

export const userOperations = {
  getById,
  updateProfile,
}

async function getById(id: string): Promise<User> {
  const user = await UserDetailModel.getById(id)
  if (!user) throw OPERATION_ERROR.RESOURCE_NOT_FOUND()

  const userSuppliers = await supplierUsersModel.getForUserId(id)

  return {
    id: user.id,
    name: user.displayName,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
    suppliers: userSuppliers.map((su) => ({
      id: su.supplierId,
      role: su.role,
    })),
  }
}

async function updateProfile(data: UserUpdateForm, authUserId: string): Promise<UserDetailRaw> {
  const user = await UserDetailModel.getById(data.id)
  if (!user) throw OPERATION_ERROR.RESOURCE_NOT_FOUND()

  if (user.id !== authUserId) throw OPERATION_ERROR.FORBIDDEN()

  const setUserDetailData: SetUserDetailRaw = emptyStringToNullIfAllowed({
    displayName: data.displayName,
    bio: data.bio,
    avatarUrl: data.avatarUrl,
    instagramUrl: data.instagramUrl,
    tiktokUrl: data.tiktokUrl,
    websiteUrl: data.websiteUrl,
  })

  return UserDetailModel.update(user.id, setUserDetailData)
}

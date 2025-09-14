import { OPERATION_ERROR } from '@/app/_types/errors'
import { UserUpdateForm } from '@/app/_types/validation-schema'
import { SetUserDetailRaw, User } from '@/models/types'
import { UserDetailModel } from '@/models/user'
import { emptyStringToNullIfAllowed } from '@/utils/empty-strings'

export const userOperations = {
  updateProfile,
}

async function updateProfile(data: UserUpdateForm, authUserId: string): Promise<User> {
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

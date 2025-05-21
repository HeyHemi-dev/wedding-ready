import { UserUpdateForm } from '@/src/app/_types/validation-schema'
import { SetUserDetailRaw, User } from '@/models/types'
import { UserDetailModel } from '@/models/user'

export const userActions = {
  updateProfile,
}

async function updateProfile({ id, displayName, bio, avatarUrl, instagramUrl, tiktokUrl, websiteUrl }: UserUpdateForm): Promise<User> {
  const user = await UserDetailModel.getById(id)
  if (!user) {
    throw new Error('User not found')
  }

  const setUserDetailData: SetUserDetailRaw = {
    displayName,
    bio,
    avatarUrl,
    instagramUrl,
    tiktokUrl,
    websiteUrl,
  }

  return UserDetailModel.update(user.id, setUserDetailData)
}

'use server'

import { revalidateTag } from 'next/cache'

import { tags } from '@/app/_types/tags'
import { UserUpdateForm, userUpdateFormSchema } from '@/app/_types/validation-schema'
import { userOperations } from '@/operations/user-operations'
import { getAuthUserId } from '@/utils/auth'
import { nullishToEmptyString } from '@/utils/empty-strings'

import { OPERATION_ERROR } from '../_types/errors'

export async function updateProfileFormAction(data: UserUpdateForm): Promise<UserUpdateForm> {
  const { success, error: parseError, data: validatedData } = userUpdateFormSchema.safeParse(data)
  if (!success || parseError) {
    throw OPERATION_ERROR.BAD_REQUEST(JSON.stringify(parseError?.flatten().fieldErrors))
  }

  const authUserId = await getAuthUserId()
  if (!authUserId) {
    throw OPERATION_ERROR.UNAUTHORIZED()
  }

  const user = await userOperations.updateProfile(validatedData, authUserId)

  revalidateTag(tags.currentUser(user.id))

  return nullishToEmptyString({
    id: user.id,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    instagramUrl: user.instagramUrl,
    tiktokUrl: user.tiktokUrl,
    websiteUrl: user.websiteUrl,
  })
}

'use server'

import { revalidateTag } from 'next/cache'

import { tags } from '@/app/_types/tags'
import { UserUpdateForm, userUpdateFormSchema } from '@/app/_types/validation-schema'
import { userOperations } from '@/operations/user-operations'
import { getAuthUserId } from '@/utils/auth'
import { nullToEmptyString } from '@/utils/empty-strings'

import { OPERATION_ERROR } from '../_types/errors'

export async function updateProfileFormAction(data: UserUpdateForm): Promise<UserUpdateForm> {
  const { success, error: parseError, data: validatedData } = userUpdateFormSchema.safeParse(data)
  if (!success || parseError) {
    throw OPERATION_ERROR.VALIDATION_ERROR()
  }

  const authUserId = await getAuthUserId()
  if (!authUserId) {
    throw OPERATION_ERROR.NOT_AUTHENTICATED()
  }

  const user = await userOperations.updateProfile(validatedData, authUserId)

  revalidateTag(tags.currentUser(user.id))

  return {
    id: user.id,
    displayName: user.displayName,
    bio: nullToEmptyString(user.bio),
    avatarUrl: nullToEmptyString(user.avatarUrl),
    instagramUrl: nullToEmptyString(user.instagramUrl),
    tiktokUrl: nullToEmptyString(user.tiktokUrl),
    websiteUrl: nullToEmptyString(user.websiteUrl),
  }
}

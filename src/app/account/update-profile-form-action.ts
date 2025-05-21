'use server'

import { revalidateTag } from 'next/cache'

import { UserUpdateForm, userUpdateFormSchema } from '@/app/_types/validation-schema'
import { getAuthUserIdFromSupabase } from '@/utils/auth'
import { nullishToEmptyString } from '@/utils/empty-strings'
import { tryCatch } from '@/utils/try-catch'

import { userOperations } from '@/operations/user-operations'

export async function updateProfileFormAction({ data }: { data: UserUpdateForm }): Promise<UserUpdateForm> {
  const { success, error: parseError, data: validatedData } = userUpdateFormSchema.safeParse(data)
  if (!success || parseError) {
    throw new Error(JSON.stringify(parseError?.flatten().fieldErrors))
  }

  const { data: authUserId, error: authUserIdError } = await tryCatch(getAuthUserIdFromSupabase())
  if (authUserIdError || !authUserId || validatedData.id !== authUserId) {
    throw new Error('Unauthorized')
  }

  const { data: user, error: updateError } = await tryCatch(userOperations.updateProfile(validatedData))

  if (updateError) {
    throw new Error(updateError?.message || 'Failed to update profile')
  }

  revalidateTag(`user-${user.id}`)

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

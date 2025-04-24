'use server'

import { revalidateTag } from 'next/cache'

import { UserUpdateForm, userUpdateFormSchema } from '@/app/_types/validation-schema'
import { tryCatch } from '@/utils/try-catch'
import { userActions } from '../_actions/user-actions'

export async function updateProfileFormAction({ data }: { data: UserUpdateForm }): Promise<UserUpdateForm> {
  const { success, error: parseError, data: validatedData } = userUpdateFormSchema.safeParse(data)
  if (!success || parseError) {
    throw new Error(JSON.stringify(parseError?.flatten().fieldErrors))
  }

  const { data: user, error: updateError } = await tryCatch(userActions.updateProfile(validatedData))

  if (updateError) {
    throw new Error(updateError?.message || 'Failed to update profile')
  }

  revalidateTag(`user-${user.id}`)

  return {
    id: user.id,
    displayName: user.displayName,
    bio: user.bio ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
    instagramUrl: user.instagramUrl ?? undefined,
    tiktokUrl: user.tiktokUrl ?? undefined,
    websiteUrl: user.websiteUrl ?? undefined,
  }
}

'use server'

import { authActions } from '@/app/_actions/auth-actions'
import { tags } from '@/app/_types/tags'
import { UserResetPasswordForm, userResetPasswordFormSchema } from '@/app/_types/validation-schema'
import { encodedRedirect } from '@/utils/encoded-redirect'
import { createClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'
import { revalidateTag } from 'next/cache'

export async function resetPasswordFormAction({ data }: { data: UserResetPasswordForm }) {
  const { success, error: parseError, data: validatedData } = userResetPasswordFormSchema.safeParse(data)
  if (!success || parseError) {
    throw new Error(JSON.stringify(parseError?.flatten().fieldErrors))
  }

  if (validatedData.password !== validatedData.confirmPassword) {
    encodedRedirect('error', '/account/reset-password', 'Passwords do not match')
  }

  const supabase = await createClient()
  if (!supabase) {
    throw new Error('Failed to reset password')
  }
  const { data: resetResult, error: resetError } = await tryCatch(authActions.resetPassword({ resetPasswordFormData: validatedData, supabaseClient: supabase }))

  if (resetError) {
    throw new Error('Failed to reset password')
  }

  // Since we can't have authentication on this operation, signout the user so they are forced to sign in again with the new password
  const { error: signOutError } = await tryCatch(authActions.signOut({ supabaseClient: supabase }))
  if (signOutError) {
    throw new Error('Failed to sign out after password reset')
  }

  // Revalidate the user cache after password update
  revalidateTag(tags.currentUser(resetResult.authUserId))
  return
}

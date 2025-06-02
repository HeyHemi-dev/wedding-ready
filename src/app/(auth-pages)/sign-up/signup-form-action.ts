'use server'

import { revalidateTag } from 'next/cache'
import { headers } from 'next/headers'

import { authOperations } from '@/operations/auth-operations'
import { UserSignupForm, userSignupFormSchema } from '@/app/_types/validation-schema'
import { createClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'
import { tags } from '@/app/_types/tags'

export async function signUpFormAction({ data }: { data: UserSignupForm }): Promise<{ handle: string }> {
  const { success, error: parseError, data: validatedData } = userSignupFormSchema.safeParse(data)
  if (!success || parseError) {
    throw new Error(JSON.stringify(parseError?.flatten().fieldErrors))
  }

  const origin = (await headers()).get('origin')
  const supabase = await createClient()
  if (!origin || !supabase) {
    throw new Error('Failed to sign up')
  }
  const { data: user, error: signUpError } = await tryCatch(authOperations.signUp({ userSignFormData: validatedData, origin, supabaseClient: supabase }))

  if (signUpError) {
    throw new Error('Failed to sign up')
  }

  // Revalidate the user cache for the new user
  revalidateTag(tags.currentUser(user.id))

  return { handle: user.handle }
}

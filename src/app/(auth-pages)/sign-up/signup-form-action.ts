'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { UserSignupForm, userSignupFormSchema } from '@/app/_types/validation-schema'
import { authOperations } from '@/operations/auth-operations'
import { createClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'

export async function signUpFormAction({ data }: { data: UserSignupForm }): Promise<void> {
  const { success, error: parseError, data: validatedData } = userSignupFormSchema.safeParse(data)
  if (!success || parseError) {
    throw new Error(JSON.stringify(parseError?.flatten().fieldErrors))
  }

  const origin = (await headers()).get('origin')
  const supabase = await createClient()
  if (!origin || !supabase) {
    throw new Error('Failed to sign up')
  }
  const { error: signUpError } = await tryCatch(authOperations.signUp({ userSignFormData: validatedData, origin, supabaseClient: supabase }))

  if (signUpError) {
    throw new Error('Failed to sign up')
  }

  // Redirect to check inbox after successful signup
  redirect('/check-inbox')
}

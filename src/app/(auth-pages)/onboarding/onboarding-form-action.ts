'use server'

import { OPERATION_ERROR } from '@/app/_types/errors'
import { OnboardingForm, onboardingFormSchema } from '@/app/_types/validation-schema'
import { authOperations } from '@/operations/auth-operations'
import { getAuthUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

export async function onboardingFormAction({ data }: { data: OnboardingForm }): Promise<void> {
  const { success, error: parseError, data: validatedData } = onboardingFormSchema.safeParse(data)
  if (!success || parseError) {
    throw new Error(JSON.stringify(parseError?.flatten().fieldErrors))
  }

  const authUserId = await getAuthUserId()
  if (!authUserId) {
    throw OPERATION_ERROR.NOT_AUTHENTICATED()
  }

  const { error } = await tryCatch(
    authOperations.completeOnboarding({
      authUserId,
      handle: validatedData.handle,
      displayName: validatedData.displayName,
    })
  )

  if (error) {
    throw OPERATION_ERROR.DATABASE_ERROR('Failed to complete onboarding')
  }
}

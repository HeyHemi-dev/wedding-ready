import { NextResponse } from 'next/server'

import { User } from '@/app/_types/users'
import { userOperations } from '@/operations/user-operations'
import { getAuthUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

export type AuthMeResponseBody = User | null

export async function GET(): Promise<NextResponse<AuthMeResponseBody>> {
  const authUserId = await getAuthUserId()
  if (!authUserId) return NextResponse.json(null)

  const { data: user, error } = await tryCatch(userOperations.getById(authUserId))
  if (error) return NextResponse.json(null)

  return NextResponse.json(user)
}

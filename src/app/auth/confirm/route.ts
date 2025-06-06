import { type EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  // The `/auth/confirm` route is required for PKCE reset password flow
  // https://supabase.com/docs/guides/auth/passwords?queryGroups=flow&flow=pkce#resetting-a-password

  const { searchParams } = new URL(request.url)
  // We can declare these types because verifyOtp will throw the error if they are invalid
  const token_hash = searchParams.get('token_hash') as string
  const type = searchParams.get('type') as EmailOtpType
  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = '/reset-password'

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash,
  })

  if (error) {
    redirectTo.pathname = '/auth-code-error'
  }

  return NextResponse.redirect(redirectTo)
}

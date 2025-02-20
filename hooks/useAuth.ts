'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Server-side auth check
export async function useAuth() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/sign-in')
  }

  return user
}

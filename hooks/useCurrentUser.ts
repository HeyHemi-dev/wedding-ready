'use server'

import { createClient } from '@/utils/supabase/server'
import type { User } from '@supabase/supabase-js'

export async function useCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  return user
}

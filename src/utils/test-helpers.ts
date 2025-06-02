import { AuthError } from '@supabase/supabase-js'
import { vi } from 'vitest'


// Mock supabase auth client
type MockSupabaseClient = {
  auth: {
    signOut: () => Promise<{ error: AuthError | null }>
  }
}

export const mockSupabase: MockSupabaseClient = {
  auth: {
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
}

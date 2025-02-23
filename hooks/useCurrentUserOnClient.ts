'use client'

import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

/**
 * A custom React hook that provides access to the current authenticated user and their data on the client side.
 *
 * @returns {Object} An object containing:
 *   - user: The current User object or null if not authenticated
 *   - loading: Boolean indicating whether the initial user fetch is in progress
 *
 * @example
 * ```tsx
 * 'use client'
 * function UserProfile() {
 *   const { user, loading } = useCurrentUserOnClient()
 *
 *   if (loading) return <div>Loading...</div>
 *   if (!user) return <div>Please log in</div>
 *
 *   return (
 *     <div>
 *       <h1>Profile</h1>
 *       <p>Email: {user.email}</p>
 *       <p>User ID: {user.id}</p>
 *     </div>
 *   )
 * }
 * ```
 *
 */
export function useCurrentUserOnClient() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}

'use client'

import { useCurrentUserOnClient } from '@/hooks/use-current-user'

export default function ProtectedClient() {
  const { user, loading } = useCurrentUserOnClient()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Protected Client Component</h1>
      <p>Welcome {user?.email}</p>
    </div>
  )
}

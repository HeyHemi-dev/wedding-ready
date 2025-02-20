'use client'

import { useAuthOnClient } from '@/hooks/useAuthOnClient'

export default function ProtectedClient() {
  const { user, loading } = useAuthOnClient()

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

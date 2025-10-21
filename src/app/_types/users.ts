import { SupplierRole } from '@/db/constants'

export type User = {
  id: string
  name: string
  handle: string
  avatarUrl: string | null
  suppliers: {
    id: string
    role: SupplierRole
  }[]
}

export type AuthUserId = string | null

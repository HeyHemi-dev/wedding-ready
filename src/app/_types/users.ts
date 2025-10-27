import { SupplierRole } from '@/db/constants'

export type User = {
  id: string
  handle: string
  displayName: string
  bio: string | null
  avatarUrl: string | null
  instagramUrl: string | null
  tiktokUrl: string | null
  websiteUrl: string | null
  suppliers: {
    id: string
    name: string
    handle: string
    role: SupplierRole
  }[]
}

export type AuthUserId = string | null

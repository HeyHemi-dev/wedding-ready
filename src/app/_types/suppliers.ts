import { Location, Service, SupplierRole } from '@/db/constants'

export type SupplierId = {
  id: string
  handle: string
}

export type SupplierSearchResult = {
  id: string
  name: string
  handle: string
}

export type Supplier = {
  id: string
  name: string
  handle: string
  websiteUrl: string | null
  description: string | null
  services: Service[]
  locations: Location[]
  users: {
    id: string
    role: SupplierRole
  }[]
}

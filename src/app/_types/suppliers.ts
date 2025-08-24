import { Location, Service, SupplierRole } from '@/db/constants'

// export type SupplierId = {
//   id: string
//   handle: string
// }

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

export type SupplierListItem = {
  id: string
  name: string
  handle: string
  mainImage: string
  thumbnailImages: string[]
  services: Service[]
  locations: Location[]
  follows: number
}

export type SupplierList = SupplierListItem[]

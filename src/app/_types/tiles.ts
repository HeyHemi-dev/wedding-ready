import { Location, Service } from '@/db/constants'

export type Tile = {
  id: string
  imagePath: string
  title: string | null
  description: string | null
  createdAt: Date
  createdByUserId: string
  location: Location | null
  credits: TileCredit[]
  isSaved: boolean | undefined
}

export type TileCredit = {
  supplierId: string
  supplierHandle: string
  supplierName: string
  service: Service | null
  serviceDescription: string | null
}

export type TileListItem = {
  id: string
  imagePath: string
  title: string | null
  description: string | null
  isSaved: boolean | undefined
}

export type FeedQueryResult = {
  tiles: TileListItem[]
  nextCursor: string | null
  hasNextPage: boolean
}

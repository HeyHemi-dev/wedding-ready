import { Location, Service } from '@/db/constants'

export const tileKeys = {
  saveState: (tileId: string, authUserId: string) => ['tile', 'saveState', tileId, authUserId] as const,
  supplierTiles: (supplierId: string) => ['tiles', 'supplier', supplierId] as const,
  userTiles: (userId: string) => ['tiles', 'user', userId] as const,
  credits: (tileId: string) => ['tile', 'credits', tileId] as const,
}

export const supplierKeys = {
  search: (query: string) => ['suppliers', 'search', query] as const,
}

export const nextCacheKey = {
  supplierList: ({ constValue }: { constValue: Location | Service }) => ['suppliers-list', constValue] as const,
}

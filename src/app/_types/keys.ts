import { Location, Service } from '@/db/constants'
import { AuthUserId } from '@/app/_types/users'

export const queryKeys = {
  authUser: () => ['authUser', 'current'] as const,
  supplierSearch: (query: string) => ['supplierSearch', query] as const,
  tileSaveState: (tileId: string, authUserId: string) => ['tileSaveState', tileId, authUserId] as const,
  supplierTiles: (supplierId: string) => ['supplierTiles', supplierId] as const,
  userTiles: (userId: string) => ['userTiles', userId] as const,
  tileCredits: (tileId: string) => ['tileCredits', tileId] as const,
  feed: (authUserId: AuthUserId) => ['feed', authUserId] as const,
}

export const nextCacheKey = {
  supplierList: ({ constValue }: { constValue: Location | Service }) => ['supplier-list', constValue] as const,
}

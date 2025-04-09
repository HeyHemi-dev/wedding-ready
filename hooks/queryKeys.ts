export const tileKeys = {
  saveState: (tileId: string, authUserId: string) => ['tile', 'saveState', tileId, authUserId] as const,
  supplierTiles: (supplierId: string, authUserId?: string) => ['tiles', supplierId, authUserId] as const,
  userTiles: (userId: string, authUserId?: string) => ['tiles', userId, authUserId] as const,
}

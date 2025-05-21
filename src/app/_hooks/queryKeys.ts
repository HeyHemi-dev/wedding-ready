export const tileKeys = {
  saveState: (tileId: string, authUserId: string) => ['tile', 'saveState', tileId, authUserId] as const,
  supplierTiles: (supplierId: string) => ['tiles', 'supplier', supplierId] as const,
  userTiles: (userId: string) => ['tiles', 'user', userId] as const,
}

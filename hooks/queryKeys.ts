export const tileKeys = {
  saveState: (tileId: string, userId: string) => ['tile', 'saveState', tileId, userId] as const,
  supplierTiles: (supplierId: string, userId?: string) => ['tiles', supplierId, userId] as const,
}

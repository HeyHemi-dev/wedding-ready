// import { describe, it, expect, vi, beforeEach } from 'vitest'

// import { Service } from '@/db/constants'
// import { TileModel } from '@/models/tile'
// import { tileOperations } from './tile-operations'

// vi.mock('@/models/tile', () => ({
//   TileModel: {
//     getRawById: vi.fn(),
//     addSupplierCredit: vi.fn(),
//     getCredits: vi.fn(),
//   },
// }))

// describe('tileOperations.addCredit', () => {
//   beforeEach(() => {
//     vi.clearAllMocks()
//   })

//   it('should add credit when user is tile creator', async () => {
//     const tileId = 'tile-1'
//     const userId = 'user-1'
//     const credit = { supplierId: 'sup-1', service: Service.FLORIST }
//     const mockCredits = [{ tileId, supplierId: 'sup-1', supplier: { id: 'sup-1' } }]
//     vi.mocked(TileModel.getRawById).mockResolvedValueOnce({ id: tileId, createdByUserId: userId })
//     vi.mocked(TileModel.addSupplierCredit).mockResolvedValueOnce({} as any)
//     vi.mocked(TileModel.getCredits).mockResolvedValueOnce(mockCredits as any)

//     const result = await tileOperations.addCredit({ tileId, credit, userId })

//     expect(TileModel.getRawById).toHaveBeenCalledWith(tileId)
//     expect(TileModel.addSupplierCredit).toHaveBeenCalledWith(tileId, credit)
//     expect(TileModel.getCredits).toHaveBeenCalledWith(tileId)
//     expect(result).toEqual(mockCredits)
//   })

//   it('should throw error if tile not found', async () => {
//     vi.mocked(TileModel.getRawById).mockResolvedValueOnce(null)
//     await expect(
//       tileOperations.addCredit({ tileId: 't', credit: { supplierId: 's' }, userId: 'u' })
//     ).rejects.toThrow()
//   })

//   it('should throw error if user is not creator', async () => {
//     vi.mocked(TileModel.getRawById).mockResolvedValueOnce({ id: 't', createdByUserId: 'other' })
//     await expect(
//       tileOperations.addCredit({ tileId: 't', credit: { supplierId: 's' }, userId: 'u' })
//     ).rejects.toThrow()
//   })
// })

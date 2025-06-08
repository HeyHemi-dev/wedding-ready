export type FindSuppliersResponse = {
  type: 'location' | 'service'
  key: string
  value: string
  supplierCount: number
}

export const tags = {
  currentUser: (id: string) => `user-${id}` as const,
  auth: 'auth' as const,
  locationSuppliers: (location: string) => `${location}-suppliers` as const,
  serviceSuppliers: (service: string) => `${service}-suppliers` as const,
  findSuppliers: 'find-suppliers' as const,
}

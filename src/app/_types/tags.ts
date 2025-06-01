export const tags = {
  currentUser: (id: string) => `user-${id}` as const,
  auth: 'auth' as const,
}

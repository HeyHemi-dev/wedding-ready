export const status = {
  Undefined: undefined,
  Pending: 'Pending',
  Error: 'Error',
  Available: true,
  Taken: false,
} as const
export type HandleStatus = (typeof status)[keyof typeof status]

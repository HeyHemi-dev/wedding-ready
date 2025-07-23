// Supplier roles
export const SUPPLIER_ROLES = {
  ADMIN: 'admin',
  STANDARD: 'standard',
} as const

export type SupplierRole = (typeof SUPPLIER_ROLES)[keyof typeof SUPPLIER_ROLES]

// Wedding supplier services
export const SERVICES = {
  // Place & food
  VENUE: 'venue',
  ACCOMODATION: 'accomodation',
  CATERER: 'caterer',
  CAKE: 'cake',
  // Capture
  PHOTOGRAPHER: 'photographer',
  VIDEOGRAPHER: 'videographer',
  // Outfit
  BRIDAL_WEAR: 'bridal_wear',
  BRIDESMAIDS_WEAR: 'bridesmaids_wear',
  BRIDAL_ACCESSORY: 'bridal_accessory',
  MENSWEAR: 'menswear',
  MENSWEAR_ACCESSORY: 'menswear_accessory',
  RINGS: 'rings',
  // Beauty
  MAKEUP: 'makeup',
  HAIR: 'hair',
  BEAUTY: 'beauty',
  // Organise
  PLANNER: 'planner',
  CELEBRANT: 'celebrant',
  MC: 'mc',
  // Style
  FLORIST: 'florist',
  STYLIST: 'stylist',
  HIRE: 'hire',
  STATIONERY: 'stationery',
  // Vibes
  BAND: 'band',
  ENTERTAINMENT: 'entertainment',
  // Logistics
  TRANSPORT: 'transport',
  SUPPORT: 'support',
} as const

export type Service = (typeof SERVICES)[keyof typeof SERVICES]

// Wedding supplier locations
export const LOCATIONS = {
  NORTHLAND: 'northland',
  AUCKLAND: 'auckland',
  WAIKATO: 'waikato',
  BAY_OF_PLENTY: 'bay_of_plenty',
  GISBORNE: 'gisborne',
  HAWKES_BAY: 'hawkes_bay',
  TARANAKI: 'taranaki',
  MANAWATU_WHANGANUI: 'manawatu_whanganui',
  WELLINGTON: 'wellington',
  NELSON_TASMAN: 'nelson_tasman',
  MARLBOROUGH: 'marlborough',
  WEST_COAST: 'west_coast',
  CANTERBURY: 'canterbury',
  OTAGO: 'otago',
  SOUTHLAND: 'southland',
} as const

export type Location = (typeof LOCATIONS)[keyof typeof LOCATIONS]

// Helper functions for easy key/value lookups
export function getKeyByValue<T extends Record<string, string>>(obj: T, value: T[keyof T]): keyof T | undefined {
  return Object.keys(obj).find((key) => obj[key as keyof T] === value) as keyof T | undefined
}

export function getValueByKey<T extends Record<string, string>>(obj: T, key: keyof T): T[keyof T] {
  return obj[key]
}

export function getKeys<T extends Record<string, string>>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}

export function getValues<T extends Record<string, string>>(obj: T): T[keyof T][] {
  return Object.values(obj) as T[keyof T][]
}

export function getEntries<T extends Record<string, string>>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][]
}

// Backward compatibility - you can gradually migrate these
export const ServiceEnum = SERVICES
export const LocationEnum = LOCATIONS
export const SupplierRoleEnum = SUPPLIER_ROLES

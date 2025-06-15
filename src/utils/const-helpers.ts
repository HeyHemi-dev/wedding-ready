import { SERVICES, LOCATIONS, SUPPLIER_ROLES } from '@/db/constants'

/**
 * Type for our const objects
 */
type ConstObject = Record<string, string>

/**
 * Converts a const object to a PostgreSQL enum array
 */
export function constToPgEnum<T extends ConstObject>(constObject: T): [T[keyof T], ...T[keyof T][]] {
  return Object.values(constObject) as [T[keyof T], ...T[keyof T][]]
}

interface PrettyConst {
  key: string
  value: string
  label: string
}

export function valueToPretty(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Converts a const object to an array of prettified objects
 * @example LOCATIONS -> [{ key: 'BAY_OF_PLENTY', value: 'bay_of_plenty', label: 'Bay Of Plenty' }]
 */
export function constToPretty<T extends ConstObject>(constObject: T): PrettyConst[] {
  return Object.entries(constObject).map(([key, value]) => ({
    key,
    value,
    label: valueToPretty(value),
  }))
}

/**
 * Gets the const value for a given key
 */
export function keyToConst<T extends ConstObject>(constObject: T, key: string): T[keyof T] {
  return constObject[key as keyof T]
}

/**
 * Gets the const key for a given value
 */
export function valueToKey<T extends ConstObject>(constObject: T, value: T[keyof T]): keyof T | undefined {
  return Object.keys(constObject).find((key) => constObject[key as keyof T] === value) as keyof T | undefined
}

/**
 * Converts a const key to a URL-friendly parameter
 * @example BAY_OF_PLENTY -> bay-of-plenty
 */
export function constKeyToParam(key: string): string {
  return key.toLowerCase().replace(/_/g, '-')
}

/**
 * Converts a URL parameter back to const key formatting
 * @example bay-of-plenty -> BAY_OF_PLENTY
 */
function paramToConstKeyFormat(param: string) {
  return param.replace(/-/g, '_').toUpperCase()
}

/**
 * Converts a URL parameter back to a const value
 * @example bay-of-plenty -> LOCATIONS.BAY_OF_PLENTY
 */
export function paramToConst<T extends ConstObject>(constObject: T, param: string): T[keyof T] {
  const key = paramToConstKeyFormat(param)
  return constObject[key as keyof T]
}

// Specific helpers for your const objects
export const serviceHelpers = {
  toPretty: () => constToPretty(SERVICES),
  keyToValue: (key: string) => keyToConst(SERVICES, key),
  valueToKey: (value: string) => {
    const entry = Object.entries(SERVICES).find(([, v]) => v === value)
    return entry ? entry[0] : undefined
  },
  keyToParam: (key: string) => constKeyToParam(key),
  paramToValue: (param: string) => paramToConst(SERVICES, param),
}

export const locationHelpers = {
  toPretty: () => constToPretty(LOCATIONS),
  keyToValue: (key: string) => keyToConst(LOCATIONS, key),
  valueToKey: (value: string) => {
    const entry = Object.entries(LOCATIONS).find(([, v]) => v === value)
    return entry ? entry[0] : undefined
  },
  keyToParam: (key: string) => constKeyToParam(key),
  paramToValue: (param: string) => paramToConst(LOCATIONS, param),
}

export const supplierRoleHelpers = {
  toPretty: () => constToPretty(SUPPLIER_ROLES),
  keyToValue: (key: string) => keyToConst(SUPPLIER_ROLES, key),
  valueToKey: (value: string) => {
    const entry = Object.entries(SUPPLIER_ROLES).find(([, v]) => v === value)
    return entry ? entry[0] : undefined
  },
  keyToParam: (key: string) => constKeyToParam(key),
  paramToValue: (param: string) => paramToConst(SUPPLIER_ROLES, param),
}

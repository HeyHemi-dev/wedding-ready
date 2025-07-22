import { SERVICES, LOCATIONS, SUPPLIER_ROLES, Service, Location, SupplierRole } from '@/db/constants'

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
 * Converts a const value to a URL-friendly parameter
 * @example bay_of_plenty -> bay-of-plenty
 */
export function constToParamFormat(constValue: string): string {
  return constValue.toLowerCase().replace(/_/g, '-')
}

/**
 * Converts a URL parameter back to const value formatting
 * @example bay-of-plenty -> bay_of_plenty
 */
function paramToConstFormat(param: string) {
  return param.replace(/-/g, '_').toLowerCase()
}

// Specific helpers for your const objects
export const serviceHelpers = {
  toPretty: () => constToPretty(SERVICES),
  keyToValue: (key: string) => keyToConst(SERVICES, key),
  valueToKey: (value: string) => {
    const entry = Object.entries(SERVICES).find(([, v]) => v === value)
    return entry ? entry[0] : undefined
  },
  constToParam: (constValue: Service) => constToParamFormat(constValue),
  paramToConst: (param: string) => paramToConstFormat(param) as Service,
}

export const locationHelpers = {
  toPretty: () => constToPretty(LOCATIONS),
  keyToValue: (key: string) => keyToConst(LOCATIONS, key),
  valueToKey: (value: string) => {
    const entry = Object.entries(LOCATIONS).find(([, v]) => v === value)
    return entry ? entry[0] : undefined
  },
  constToParam: (constValue: Location) => constToParamFormat(constValue),
  paramToConst: (param: string) => paramToConstFormat(param) as Location,
}

export const supplierRoleHelpers = {
  toPretty: () => constToPretty(SUPPLIER_ROLES),
  keyToValue: (key: string) => keyToConst(SUPPLIER_ROLES, key),
  valueToKey: (value: string) => {
    const entry = Object.entries(SUPPLIER_ROLES).find(([, v]) => v === value)
    return entry ? entry[0] : undefined
  },
  constToParam: (constValue: SupplierRole) => constToParamFormat(constValue),
  paramToConst: (param: string) => paramToConstFormat(param) as SupplierRole,
}

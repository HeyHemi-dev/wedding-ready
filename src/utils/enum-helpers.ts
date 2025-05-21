/**
 * Type for our string-based enums
 */
type StringEnum = { [key: string]: string }

/**
 * Converts an enum to a PostgreSQL enum array
 * @param enumObject - The enum to convert
 * @returns A tuple of enum values preserving the enum type
 */
export function enumToPgEnum<T extends StringEnum>(enumObject: T): [T[keyof T], ...T[keyof T][]] {
  return Object.values(enumObject) as [T[keyof T], ...T[keyof T][]]
}

interface PrettyEnum {
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
 * Converts an enum to a array of prettified objects
 * @example Location -> [{ key: 'BAY_OF_PLENTY', value: 'bay-of-plenty', label: 'Bay of Plenty' }]
 * @returns PrettyEnum[] with:
 * key (enum key),
 * value (enum value),
 * label (prettified value)
 */
export function enumToPretty<T extends StringEnum>(enumObject: T): PrettyEnum[] {
  return Object.entries(enumObject).map(([key, value]) => ({
    key,
    value,
    label: valueToPretty(value),
  }))
}

/**
 * Gets the enum value for a given key
 */
export function keyToEnum<T extends StringEnum>(enumObject: T, key: string): T[keyof T] {
  return enumObject[key as keyof T]
}

/**
 * Converts an enum key to a URL-friendly parameter
 * @example BAY_OF_PLENTY -> bay-of-plenty
 */
export function enumKeyToParam(key: string): string {
  return key.toLowerCase().replace(/_/g, '-')
}

/**
 * Converts a URL parameter back to enum key formatting
 * @example bay-of-plenty -> BAY_OF_PLENTY
 */
function paramToEnumKeyFormat(param: string) {
  return param.replace(/-/g, '_').toUpperCase()
}

/**
 * Converts a URL parameter back to an enum value
 * @example bay-of-plenty -> Location.BAY_OF_PLENTY
 */
export function paramToEnum<T extends StringEnum>(enumObject: T, param: string): T[keyof T] {
  const key = paramToEnumKeyFormat(param)
  return enumObject[key as keyof T]
}

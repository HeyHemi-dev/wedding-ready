export function enumToPgEnum<T extends Record<string, any>>(myEnum: T): [T[keyof T], ...T[keyof T][]] {
  return Object.values(myEnum).map((value: any) => `${value}`) as any
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
export function enumToPretty<T extends { [key: string]: string }>(enumObject: T): PrettyEnum[] {
  return Object.values(enumObject).map((value, index) => ({
    key: Object.keys(enumObject)[index],
    value,
    label: valueToPretty(value),
  }))
}

/**
 * Converts an enum key to a URL-friendly parameter
 * @example BAY_OF_PLENTY -> bay-of-plenty
 */
export function enumKeyToParam(key: string): string {
  return key.toLowerCase().replace(/_/g, '-')
}

/**
 * Converts a URL parameter back to an enum key
 * @example bay-of-plenty -> BAY_OF_PLENTY
 */
export function paramToEnumKey<T extends { [K in string]: string }>(param: string, enumObj: T): keyof T {
  return param.replace(/-/g, '_').toUpperCase() as keyof T
}

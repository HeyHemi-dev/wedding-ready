/**
 * Convert null or undefined values to an empty string
 * @param object - The object to convert
 * @returns A new object with null or undefined values converted to an empty string
 */
export function nullishToEmptyString<T extends Record<string, any>>(object: T): { [K in keyof T]: Exclude<T[K], null | undefined> | '' } {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, value == null ? '' : value])) as any
}

/**
 * Convert empty strings to undefined
 * @param object - The object to convert
 * @returns A new object with empty strings converted to undefined
 */
export function emptyStringToUndefined<T extends Record<string, any>>(object: T): { [K in keyof T]: Exclude<T[K], ''> | undefined } {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, value === '' ? undefined : value])) as any
}

/**
 * Convert empty strings to null
 * @param object - The object to convert
 * @returns A new object with empty strings converted to null
 */
export function emptyStringToNull<T extends Record<string, any>>(object: T): { [K in keyof T]: Exclude<T[K], ''> | null } {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, value === '' ? null : value])) as any
}

/**
 * A helper mapped type that only “transforms” properties that allow null
 */
type NullableEmptyStrings<T> = {
  [K in keyof T]: null extends T[K] // does this property allow null?
    ? Exclude<T[K], ''> | null // if so, map "" → null
    : T[K] // otherwise leave it alone
}

/**
 * Convert empty strings that are allowed to be null to null
 * @param object - The object to convert
 * @returns A new object with empty strings converted to null
 */
export function emptyStringToNullIfAllowed<T extends Record<string, any>>(object: T): NullableEmptyStrings<T> {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, value === '' ? null : value])) as NullableEmptyStrings<T>
}

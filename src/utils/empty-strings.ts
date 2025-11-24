/**
 * Type for values that can be converted to/from empty strings
 */
type EmptyStringConvertible = string | number | boolean | Date | null | undefined

/**
 * Type for the result of converting nullish values to empty strings
 */
type NullishToEmptyStringResult<T> = { [K in keyof T]: Exclude<T[K], null | undefined> | '' }

/**
 * Convert null or undefined values to an empty string
 * @param object - The object to convert
 * @returns A new object with null or undefined values converted to an empty string
 */
export function nullishToEmptyString<T extends Record<string, EmptyStringConvertible>>(object: T): NullishToEmptyStringResult<T> {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, value == null ? '' : value])) as NullishToEmptyStringResult<T>
}

/**
 * A helper mapped type that only "transforms" properties that allow null
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
export function emptyStringToNullIfAllowed<T extends Record<string, EmptyStringConvertible>>(object: T): NullableEmptyStrings<T> {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, value === '' ? null : value])) as NullableEmptyStrings<T>
}

export function emptyStringToNull<T>(value: T): T | null {
  return value === '' ? null : value
}

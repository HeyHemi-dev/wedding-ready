import { z } from 'zod'

/**
 * Allows a string schema to accept either a valid string (per the schema) or an empty string.
 * Useful for optional fields that use empty strings as "null" values (converted to null before DB).
 *
 * @example
 * optionalField(z.string().trim().min(1)) // 'abc' or ''
 */
export function optionalField<T extends z.ZodString>(schema: T): z.ZodUnion<[T, z.ZodLiteral<''>]> {
  return schema.or(z.literal(''))
}

/**
 * Converts an empty string to null.
 * Useful for converting empty strings to null before DB.
 *
 * @example
 * emptyStringToNull('') // null
 * emptyStringToNull('hello') // 'hello'
 */
export function emptyStringToNull<T>(value: T): T | null {
  return value === '' ? null : value
}

type NullToEmpty<T> = T extends null ? '' : T

/**
 * Converts a null value to an empty string.
 * Useful for converting null values to empty strings before DB.
 *
 * @example
 * nullToEmptyString(null) // ''
 * nullToEmptyString('hello') // 'hello'
 */
export function nullToEmptyString<T>(value: T): NullToEmpty<T> {
  // we can safely cast because we know that null is the only value that can be converted to an empty string
  return (value === null ? '' : value) as NullToEmpty<T>
}

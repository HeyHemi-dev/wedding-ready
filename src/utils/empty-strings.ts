export function emptyStringToNull<T>(value: T): T | null {
  return value === '' ? null : value
}

type NullToEmpty<T> = T extends null ? '' : T

export function nullToEmptyString<T>(value: T): NullToEmpty<T> {
  // we can safely cast because we know that null is the only value that can be converted to an empty string
  return (value === null ? '' : value) as NullToEmpty<T>
}

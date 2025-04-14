export function enumToPgEnum<T extends Record<string, any>>(myEnum: T): [T[keyof T], ...T[keyof T][]] {
  return Object.values(myEnum).map((value: any) => `${value}`) as any
}

interface PrettyEnum {
  value: string
  label: string
}

export function valueToPretty(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function enumToPretty<T extends { [key: string]: string }>(enumObject: T): PrettyEnum[] {
  return Object.values(enumObject).map((value) => ({
    value,
    label: valueToPretty(value),
  }))
}

/**
 * Converts an enum key to a URL-friendly parameter
 * @example BAY_OF_PLENTY -> bay-of-plenty
 */
export function enumLabelToParam(label: string): string {
  return label.toLowerCase().replace(/_/g, '-')
}

/**
 * Converts a URL parameter back to an enum key
 * @example bay-of-plenty -> BAY_OF_PLENTY
 */
export function paramToEnumLabel<T extends { [K in string]: string }>(param: string, enumObj: T): keyof T {
  return param.replace(/-/g, '_').toUpperCase() as keyof T & string
}

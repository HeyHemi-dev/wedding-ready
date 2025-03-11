interface PrettyEnum {
  value: string
  label: string
}

function toPretty(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function enumToPretty<T extends { [key: string]: string }>(enumObject: T): PrettyEnum[] {
  return Object.values(enumObject).map((value) => ({
    value,
    label: toPretty(value),
  }))
}

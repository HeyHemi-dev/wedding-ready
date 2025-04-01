// Convert BigInt to number
const replaceBigInt = (key: string, value: any) => {
  if (typeof value === 'bigint') {
    return Number(value)
  }
  return value
}

export default replaceBigInt

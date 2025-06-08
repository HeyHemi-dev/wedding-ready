export function sleep(ms: number) {
  console.log('sleeping for', ms, 'ms')
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Given a past Date, returns one of:
 *  - "less than 1 minute ago"
 *  - "about 1 minute ago"
 *  - "about X minutes ago"
 *  - "about 1 hour ago"
 *  - "about X hours ago"
 *  - "about 1 day ago"
 *  - "about X days ago"
 */
export function formatRelativeDate(date: Date): string {
  const now = Date.now()

  const diffSec = Math.floor((now - date.getTime()) / 1000)
  if (diffSec < 60) {
    return 'less than 1 minute ago'
  }
  if (diffSec < 120) {
    return 'about 1 minute ago'
  }

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) {
    return `about ${diffMin} minutes ago`
  }
  if (diffMin < 120) {
    return 'about 1 hour ago'
  }

  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) {
    return `about ${diffHr} hours ago`
  }
  if (diffHr < 48) {
    return 'about 1 day ago'
  }

  const diffDay = Math.floor(diffHr / 24)
  return `about ${diffDay} days ago`
}

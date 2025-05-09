import { ArrowUpRight, InfoIcon } from 'lucide-react'
import Link from 'next/link'

export function SmtpMessage() {
  return (
    <div className="gap-partner flex rounded bg-secondary px-5 py-3">
      <InfoIcon size={16} className="mt-0.5" />
      <div className="flex flex-col gap-spouse">
        <small className="text-sm">
          <strong> Note:</strong> Emails are rate limited. Enable Custom SMTP to increase the rate limit.
        </small>
        <div>
          <Link
            href="https://supabase.com/docs/guides/auth/auth-smtp"
            target="_blank"
            className="flex items-center gap-spouse text-sm text-secondary-foreground">
            Learn more <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function SignUpConfirmation() {
  return (
    <>
      <div className="grid gap-xs text-center">
        <h1 className="font-serif text-4xl font-medium">Thanks for signing up!</h1>
        <p className="text text-sm text-foreground">We&apos;ve sent you an email to confirm your account.</p>
      </div>
      <div className="flex flex-col gap-sm">
        <Button variant="outline" asChild>
          <Link href="https://mail.google.com" target="_blank">
            Open Gmail
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="https://outlook.live.com/mail/" target="_blank">
            Open Outlook
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="https://outlook.office.com/mail/" target="_blank">
            Open Office 365
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="https://icloud.com/mail/" target="_blank">
            Open iCloud Mail
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/feed">Skip for now</Link>
        </Button>
      </div>
    </>
  )
}

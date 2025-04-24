import { Button } from '@/components/ui/button'
import { getAuthUserId } from '@/utils/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function SignupConfirmation() {
  // If user is already logged in, they don't need to be here.
  const authUserId = await getAuthUserId()

  if (authUserId) {
    redirect('/feed')
  }

  return (
    <>
      <div className="grid gap-xxs text-center">
        <h1 className="text-2xl font-medium">Thanks for signing up!</h1>
        <p className="text text-sm text-foreground">We've sent you an email to confirm your account. Please check your email and click the link to continue.</p>
      </div>
      <div className="flex flex-col gap-sm">
        <Button variant="outline" asChild>
          <Link href="https://mail.google.com">Open Gmail</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="https://outlook.live.com/mail/">Open Outlook</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="https://outlook.office.com/mail/">Open Office 365</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="https://icloud.com">Open iCloud Mail</Link>
        </Button>
      </div>
    </>
  )
}

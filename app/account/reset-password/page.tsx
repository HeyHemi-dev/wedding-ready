import { resetPasswordAction } from '@/actions/auth-actions'
import { FormMessage, Message } from '@/components/form-message'
import Field from '@/components/form/field'
import { SubmitButton } from '@/components/submit-button'
import { Input } from '@/components/ui/input'

export default async function ResetPassword(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams
  return (
    <form action={resetPasswordAction} className="grid gap-md">
      <div className="grid gap-xxs">
        <h1 className="text-2xl font-medium">Reset password</h1>
        <p className="text-sm text-foreground/60">Please enter your new password below.</p>
      </div>
      <Field label="New password" htmlFor="password">
        <Input type="password" name="password" placeholder="New password" required />
      </Field>
      <Field label="Confirm password" htmlFor="confirmPassword">
        <Input type="password" name="confirmPassword" placeholder="Confirm password" required />
      </Field>
      <SubmitButton>Reset password</SubmitButton>
      <FormMessage message={searchParams} />
    </form>
  )
}

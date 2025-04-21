import { authActions } from '@/app/_actions/auth-actions'

import Field from '@/components/form/field'
import { FormMessage, Message } from '@/components/form/form-message'
import { SubmitButton } from '@/components/submit-button'
import { Input } from '@/components/ui/input'
import { encodedRedirect } from '@/utils/encoded-redirect'
import { tryCatch } from '@/utils/try-catch'
import { revalidateTag } from 'next/cache'

export default async function ResetPassword(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams
  return (
    <>
      <div className="grid gap-xxs">
        <h1 className="text-2xl font-medium">Reset password</h1>
        <p className="text-sm text-foreground/60">Please enter your new password below.</p>
      </div>
      <form action={resetPasswordFormAction} className="grid gap-sm">
        <Field label="New password" htmlFor="password">
          <Input type="password" name="password" placeholder="New password" required />
        </Field>
        <Field label="Confirm password" htmlFor="confirmPassword">
          <Input type="password" name="confirmPassword" placeholder="Confirm password" required />
        </Field>
        <SubmitButton>Reset password</SubmitButton>
        <FormMessage message={searchParams} />
      </form>
    </>
  )
}

async function resetPasswordFormAction(formData: FormData) {
  'use server'
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    encodedRedirect('error', '/account/reset-password', 'Password and confirm password are required')
  }

  if (password !== confirmPassword) {
    encodedRedirect('error', '/account/reset-password', 'Passwords do not match')
  }

  const { data: authUser, error } = await tryCatch(authActions.resetPassword({ password, confirmPassword }))

  if (error) {
    encodedRedirect('error', '/account/reset-password', 'Password update failed')
  }

  // Revalidate the user cache after password update
  if (authUser) {
    revalidateTag(`user-${authUser.id}`)
  }

  encodedRedirect('success', '/account/reset-password', 'Password updated')
}

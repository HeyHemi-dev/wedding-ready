'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { userResetPasswordFormSchema, UserResetPasswordForm } from '@/app/_types/validation-schema'
import { FormFieldItem } from '@/components/form/field'
import { SubmitButton } from '@/components/submit-button'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { encodedRedirect } from '@/utils/encoded-redirect'
import { tryCatch } from '@/utils/try-catch'

import { resetPasswordFormAction } from './reset-password-form-action'

export default function ResetPasswordForm() {
  const router = useRouter()

  const form = useForm<UserResetPasswordForm>({
    resolver: zodResolver(userResetPasswordFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  })

  async function onSubmit(data: UserResetPasswordForm) {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match')
    }

    const { error } = await tryCatch(resetPasswordFormAction({ data }))
    if (error) {
      toast.error(error.message)
      return encodedRedirect('error', '/sign-up', error.message)
    }

    toast.success('Password updated')
    router.push(`/sign-in`)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-close-friend">
        <div className="grid gap-sibling">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormFieldItem label="Password">
                <FormControl>
                  <Input {...field} placeholder="Your password" type="password" required />
                </FormControl>
              </FormFieldItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormFieldItem label="Confirm password">
                <FormControl>
                  <Input {...field} placeholder="Confirm password" type="password" required />
                </FormControl>
              </FormFieldItem>
            )}
          />
        </div>
        <SubmitButton>Reset Password</SubmitButton>
      </form>{' '}
    </Form>
  )
}

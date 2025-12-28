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
import { PARAMS } from '@/utils/constants'
import { tryCatch } from '@/utils/try-catch'

import { handleSupabaseUpdatePassword } from '@/components/auth/auth-handlers'
import { browserSupabase } from '@/utils/supabase/client'
import { buildUrlWithSearchParams } from '@/utils/api-helpers'
import { MESSAGE_CODES } from '@/components/auth/auth-message'

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
    const { error } = await tryCatch(handleSupabaseUpdatePassword(browserSupabase, data))
    if (error) {
      toast.error(error.message)
      return router.push(
        buildUrlWithSearchParams('/reset-password', {
          [PARAMS.MESSAGE_TYPE]: 'error',
          [PARAMS.AUTH_MESSAGE_CODE]: MESSAGE_CODES.PASSWORD_UPDATE_FAILED,
        })
      )
    }

    toast.success('Password updated')
    router.push(
      buildUrlWithSearchParams('/sign-in', {
        [PARAMS.MESSAGE_TYPE]: 'success',
        [PARAMS.AUTH_MESSAGE_CODE]: MESSAGE_CODES.PASSWORD_UPDATE_SUCCESS,
      })
    )
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
                  <Input {...field} placeholder="Confirm password" type="password" required onBlur={() => form.trigger()} />
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

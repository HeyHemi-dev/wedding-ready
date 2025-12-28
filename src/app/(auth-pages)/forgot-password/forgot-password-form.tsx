'use client'

import React from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { UserForgotPasswordForm, userForgotPasswordFormSchema } from '@/app/_types/validation-schema'
import { handleSupabaseForgotPassword } from '@/components/auth/auth-handlers'
import { FormFieldItem } from '@/components/form/field'
import { SubmitButton } from '@/components/submit-button'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { browserSupabase } from '@/utils/supabase/client'
import { tryCatch } from '@/utils/try-catch'

export default function ForgotPasswordForm() {
  const form = useForm<UserForgotPasswordForm>({
    resolver: zodResolver(userForgotPasswordFormSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onBlur',
  })

  React.useEffect(() => {
    form.setFocus('email')
  }, [form])

  async function onSubmit(data: UserForgotPasswordForm) {
    const { error } = await tryCatch(handleSupabaseForgotPassword(browserSupabase, data))
    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Check your email for a link to reset your password.')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-friend">
        <div className="grid gap-sibling">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormFieldItem label="Email" htmlFor="email">
                <FormControl>
                  <Input {...field} placeholder="you@example.com" required />
                </FormControl>
              </FormFieldItem>
            )}
          />
        </div>
        <SubmitButton pendingChildren={'Sending reset email...'}>Send Reset Email</SubmitButton>
      </form>
    </Form>
  )
}

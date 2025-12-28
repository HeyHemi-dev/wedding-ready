'use client'

import React from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { UserSignupForm, userSignupFormSchema } from '@/app/_types/validation-schema'
import { handleSupabaseSignUpWithPassword } from '@/components/auth/auth-handlers'
import { AuthOptionsButton } from '@/components/auth/auth-options-button'
import { FormFieldItem } from '@/components/form/field'
import { SubmitButton } from '@/components/submit-button'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { browserSupabase } from '@/utils/supabase/client'
import { tryCatch } from '@/utils/try-catch'
import { buildUrlWithSearchParams } from '@/utils/api-helpers'
import { AllowedNextPath, PARAMS } from '@/utils/constants'

export default function SignUpWithEmailPasswordForm({ next }: { next: AllowedNextPath }) {
  const router = useRouter()
  const [showForm, setShowForm] = React.useState(false)
  const form = useForm<UserSignupForm>({
    resolver: zodResolver(userSignupFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  })

  React.useEffect(() => {
    form.setFocus('email')
  }, [form])

  async function onSubmit(data: UserSignupForm) {
    const { error } = await tryCatch(handleSupabaseSignUpWithPassword(browserSupabase, data))

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success("We've sent you an email with a link to verify your account. If you don't see it, check your spam folder.")

    router.push(buildUrlWithSearchParams('/sign-up/check-inbox', { [PARAMS.NEXT]: next }))
  }

  return (
    <Form {...form}>
      {showForm ? (
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-close-friend">
          <div className="grid gap-sibling">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormFieldItem label="Email">
                  <FormControl>
                    <Input {...field} placeholder="you@example.com" type="email" required />
                  </FormControl>
                </FormFieldItem>
              )}
            />
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
          </div>

          <SubmitButton pendingChildren={'Signing Up...'}>Sign Up</SubmitButton>
        </form>
      ) : (
        <AuthOptionsButton onClick={() => setShowForm(!showForm)} icon="email">
          Continue with email and password
        </AuthOptionsButton>
      )}
    </Form>
  )
}

'use client'

import React from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { UserSigninForm, userSigninFormSchema } from '@/app/_types/validation-schema'
import { handleSupabaseSignInWithPassword } from '@/components/auth/auth-handlers'
import { AuthOptionsButton } from '@/components/auth/auth-options-button'
import { FormFieldItem } from '@/components/form/field'
import { SubmitButton } from '@/components/submit-button'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { AllowedNextPath } from '@/utils/constants'
import { browserSupabase } from '@/utils/supabase/client'
import { tryCatch } from '@/utils/try-catch'

export default function LoginWithEmailPasswordForm({ next }: { next: AllowedNextPath }) {
  const router = useRouter()
  const [showForm, setShowForm] = React.useState(false)
  const hasRunAutoFocus = React.useRef(false)
  const form = useForm<UserSigninForm>({
    resolver: zodResolver(userSigninFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  })

  React.useEffect(() => {
    if (!showForm || hasRunAutoFocus.current) return
    hasRunAutoFocus.current = true
    form.setFocus('email')
  }, [form, showForm])

  async function onSubmit(data: UserSigninForm) {
    const { error } = await tryCatch(handleSupabaseSignInWithPassword(browserSupabase, data))
    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Logged in successfully')
    router.push(next)
  }

  return (
    <Form {...form}>
      {showForm ? (
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-friend">
          <div className="grid gap-sibling">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormFieldItem label="Email" htmlFor="email">
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
                <FormFieldItem label="Password" htmlFor="password">
                  <FormControl>
                    <Input {...field} placeholder="Your password" type="password" required />
                  </FormControl>
                </FormFieldItem>
              )}
            />
          </div>
          <SubmitButton pendingChildren={'Logging In...'}>Log In</SubmitButton>
        </form>
      ) : (
        <AuthOptionsButton
          icon="email"
          method="email"
          onClick={() => {
            setShowForm(true)
          }}>
          Continue with email and password
        </AuthOptionsButton>
      )}
    </Form>
  )
}

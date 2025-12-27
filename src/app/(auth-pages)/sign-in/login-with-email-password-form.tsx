'use client'

import React from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { OPERATION_ERROR } from '@/app/_types/errors'
import { UserSigninForm, userSigninFormSchema } from '@/app/_types/validation-schema'
import { handleSupabaseSignInWithPassword } from '@/components/auth/auth-handlers'
import { AuthOptionsButton } from '@/components/auth/auth-options-button'
import { FormFieldItem } from '@/components/form/field'
import { SubmitButton } from '@/components/submit-button'
import { Form , FormControl, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { emptyStringToNull } from '@/utils/empty-strings'
import { browserSupabase } from '@/utils/supabase/client'
import { tryCatch } from '@/utils/try-catch'

export function LoginWithEmailPasswordFormButton() {
  const [showForm, setShowForm] = React.useState(false)
  return (
    <>
      {showForm ? (
        <LoginWithEmailPasswordForm />
      ) : (
        <AuthOptionsButton onClick={() => setShowForm(!showForm)} icon="email">
          Continue with email and password
        </AuthOptionsButton>
      )}
    </>
  )
}

export default function LoginWithEmailPasswordForm() {
  const router = useRouter()
  const form = useForm<UserSigninForm>({
    resolver: zodResolver(userSigninFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  })

  React.useEffect(() => {
    form.setFocus('email')
  }, [form])

  async function onSubmit(data: UserSigninForm) {
    const { error } = await tryCatch(handleSupabaseSignInWithPassword(browserSupabase, data))
    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Logged in successfully')
    router.push('/feed')
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormFieldItem label="Password" htmlFor="password">
                <FormControl>
                  <Input {...field} placeholder="Your password" required />
                </FormControl>
              </FormFieldItem>
            )}
          />
        </div>
        <SubmitButton pendingChildren={'Logging In...'}>Log In</SubmitButton>
      </form>
    </Form>
  )
}

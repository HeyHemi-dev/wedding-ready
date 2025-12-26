'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { UserSignupForm, userSignupFormSchema } from '@/app/_types/validation-schema'
import { FormFieldItem } from '@/components/form/field'
import { SubmitButton } from '@/components/submit-button'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { tryCatch } from '@/utils/try-catch'

import { signUpFormAction } from './signup-form-action'
import React from 'react'
import { AuthOptionsButton } from '../sign-in/auth-options-button'
import { useRouter } from 'next/router'
import { OPERATION_ERROR } from '@/app/_types/errors'
import { browserSupabase } from '@/utils/supabase/client'

export function SignUpWithEmailPasswordFormButton() {
  const [showForm, setShowForm] = React.useState(false)
  return (
    <>
      {showForm ? (
        <SignUpWithEmailPasswordForm />
      ) : (
        <AuthOptionsButton onClick={() => setShowForm(!showForm)} icon="email">
          Continue with email and password
        </AuthOptionsButton>
      )}
    </>
  )
}

export default function SignUpWithEmailPasswordForm() {
  const router = useRouter()
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
    const { error } = await tryCatch(handleSignUp(data))

    if (error) {
      toast.error(error.message)
      return
    }

    // signUpFormAction redirects to /check-inbox, so we shouldn't reach here
    // But if we do, show success message
    toast.success('Thanks for signing up! Please check your email for a verification link.')
    router.push('/check-inbox')
  }

  return (
    <Form {...form}>
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
    </Form>
  )
}

async function handleSignUp(data: UserSignupForm) {
  const { success, data: validatedData } = userSignupFormSchema.safeParse(data)
  if (!success) {
    throw OPERATION_ERROR.VALIDATION_ERROR('Invalid email or password')
  }

  const { error } = await browserSupabase.auth.signUp({
    email: validatedData.email,
    password: validatedData.password,
  })

  if (error) {
    throw OPERATION_ERROR.INVALID_STATE(error.message)
  }

  return
}

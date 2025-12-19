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

export default function SignUpForm() {
  const form = useForm<UserSignupForm>({
    resolver: zodResolver(userSignupFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  })

  async function onSubmit(data: UserSignupForm) {
    const { error } = await tryCatch(signUpFormAction({ data }))
    if (error) {
      toast.error(error.message)
      return
    }

    // signUpFormAction redirects to /check-inbox, so we shouldn't reach here
    // But if we do, show success message
    toast.success('Thanks for signing up! Please check your email for a verification link.')
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

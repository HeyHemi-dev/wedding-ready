'use client'

import { useEffect, useState, useRef } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { HandleStatus, status } from '@/app/_types/handle-available-status'
import { UserSignupForm, userSignupFormSchema } from '@/app/_types/validation-schema'
import { FormFieldItem } from '@/components/form/field'
import { SubmitButton } from '@/components/submit-button'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { tryCatch } from '@/utils/try-catch'
import { HandleGetResponseBody } from '@/app/api/users/check-handle/[handle]/route'
import { tryCatchFetch } from '@/utils/try-catch'

import { signUpFormAction } from './signup-form-action'
import { CheckCircle, XCircle } from 'lucide-react'
import { LoaderCircle } from 'lucide-react'

export default function SignUpForm() {
  const router = useRouter()
  const controller = useRef(new AbortController())
  const [handleStatus, setHandleStatus] = useState<HandleStatus>(status.Undefined)
  const form = useForm<UserSignupForm>({
    resolver: zodResolver(userSignupFormSchema),
    defaultValues: {
      email: '',
      password: '',
      displayName: '',
      handle: '',
    },
    mode: 'onBlur',
  })

  async function fetchHandleAvailability(value: string) {
    setHandleStatus(status.Pending)

    // Abort any existing request and create a new controller for this request
    controller.current.abort()
    controller.current = new AbortController()

    const { data, error } = await tryCatchFetch<HandleGetResponseBody>(`/api/users/check-handle/${value}`, { signal: controller.current.signal })

    if (error) {
      setHandleStatus(status.Error)
      return
    }
    if (data?.isAvailable) {
      setHandleStatus(status.Available)
    } else {
      setHandleStatus(status.Taken)
    }
  }

  // Cleanup fetch request on unmount
  useEffect(() => {
    return () => {
      controller.current.abort()
    }
  }, [])

  async function onSubmit(data: UserSignupForm) {
    if (handleStatus !== status.Available) {
      toast.error('Handle is already taken')
      return
    }
    const { data: user, error } = await tryCatch(signUpFormAction({ data }))
    if (error) {
      toast.error(error.message)
    }
    if (user) {
      toast.success('Thanks for signing up! Please check your email for a verification link.')
      router.push(`/sign-up/confirmation`)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-sm">
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

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormFieldItem label="Display name" hint="Your name as it appears on your profile. You can change this later.">
              <FormControl>
                <Input {...field} placeholder="Your name" />
              </FormControl>
            </FormFieldItem>
          )}
        />

        <FormField
          control={form.control}
          name="handle"
          render={({ field }) => (
            <FormFieldItem label="Handle">
              <FormControl>
                <div className="flex flex-row items-center gap-xs">
                  <Input
                    {...field}
                    placeholder="your-handle"
                    onBlur={async (e) => {
                      field.onBlur()
                      const isValid = await form.trigger('handle')
                      if (!isValid) {
                        setHandleStatus(status.Undefined)
                        return
                      }
                      await fetchHandleAvailability(e.target.value)
                    }}
                  />
                  {handleStatus === status.Pending && <LoaderCircle className="h-6 w-6 animate-spin" />}
                  {handleStatus === status.Available && <CheckCircle className="h-6 w-6 text-green-500" />}
                  {handleStatus === status.Taken && <XCircle className="h-6 w-6 text-red-500" />}
                </div>
              </FormControl>
            </FormFieldItem>
          )}
        />

        <SubmitButton pendingChildren={'Signing up...'}>Sign up</SubmitButton>
      </form>
    </Form>
  )
}

'use client'

import { useEffect, useState, useRef } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle, XCircle, LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { HandleStatus, status } from '@/app/_types/handle-available-status'
import { type OnboardingForm as FormValues, onboardingFormSchema } from '@/app/_types/validation-schema'
import { HandleGetResponseBody } from '@/app/api/users/check-handle/[handle]/route'
import { FormFieldItem } from '@/components/form/field'
import { SubmitButton } from '@/components/submit-button'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { AllowedNextPath } from '@/utils/constants'
import { tryCatch, tryCatchFetch } from '@/utils/try-catch'

import { onboardingFormAction } from './onboarding-form-action'

export default function OnboardingForm({ next }: { next: AllowedNextPath }) {
  const router = useRouter()

  const controller = useRef(new AbortController())
  const [handleStatus, setHandleStatus] = useState<HandleStatus>(status.Undefined)
  const form = useForm<FormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      handle: '',
      displayName: '',
      avatarUrl: '',
    },
    mode: 'onBlur',
  })

  async function fetchHandleAvailability(value: string) {
    setHandleStatus(status.Pending)

    // Abort any existing request and create a new controller for this request
    controller.current.abort()
    controller.current = new AbortController()

    const { data, error } = await tryCatchFetch<HandleGetResponseBody>(`/api/users/check-handle/${value}`, {
      signal: controller.current.signal,
    })

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

  async function onSubmit(data: FormValues) {
    if (handleStatus !== status.Available) {
      toast.error('Handle is already taken')
      return
    }

    const { error } = await tryCatch(onboardingFormAction({ data }))
    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Profile created successfully!')
    router.push(next)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-close-friend">
        <div className="grid gap-sibling">
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
        </div>

        <SubmitButton pendingChildren={'Creating Profile...'}>Complete Setup</SubmitButton>
      </form>
    </Form>
  )
}

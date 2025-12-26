'use client'

import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Form } from '@/components/ui/form'

import { PARAMS } from '@/utils/constants'
import { browserSupabase } from '@/utils/supabase/client'
import { tryCatch } from '@/utils/try-catch'
import { AuthOptionsButton } from '@/components/auth/auth-options-button'
import { handleSupabaseSignInWithGoogle } from '@/components/auth/auth-handlers'

export default function LoginWithGoogleForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get(PARAMS.NEXT) ?? '/feed'
  const form = useForm({})

  async function onSubmit() {
    const { error } = await tryCatch(handleSupabaseSignInWithGoogle(browserSupabase, next))
    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Logged in successfully')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <AuthOptionsButton type="submit" disabled={form.formState.isSubmitting} icon={'google'}>
          Continue with Google
        </AuthOptionsButton>
      </form>
    </Form>
  )
}

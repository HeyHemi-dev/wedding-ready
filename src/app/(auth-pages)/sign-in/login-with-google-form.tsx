'use client'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { handleSupabaseSignInWithGoogle } from '@/components/auth/auth-handlers'
import { AuthOptionsButton } from '@/components/auth/auth-options-button'
import { Form } from '@/components/ui/form'
import { AllowedNextPath } from '@/utils/constants'
import { browserSupabase } from '@/utils/supabase/client'
import { tryCatch } from '@/utils/try-catch'

export default function LoginWithGoogleForm({ next }: { next: AllowedNextPath }) {
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

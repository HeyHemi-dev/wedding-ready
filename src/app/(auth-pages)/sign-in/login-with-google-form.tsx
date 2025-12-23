'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Form } from '@/components/ui/form'
import { OPERATION_ERROR } from '@/app/_types/errors'

import { getOrigin } from '@/utils/api-helpers'
import { PARAMS } from '@/utils/constants'
import { browserSupabase } from '@/utils/supabase/client'
import { tryCatch } from '@/utils/try-catch'
import { AuthOptionsButton } from '@/app/(auth-pages)/sign-in/auth-options-button'

export default function LoginWithGoogleForm() {
  const router = useRouter()
  const form = useForm({})

  async function onSubmit() {
    const { error } = await tryCatch(handleLogin())
    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Logged in successfully')
    router.push('/feed')
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

async function handleLogin(): Promise<void> {
  const origin = getOrigin()
  const { error } = await browserSupabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?${PARAMS.NEXT}=${encodeURIComponent('/feed')}`,
    },
  })

  if (error) {
    throw OPERATION_ERROR.INVALID_STATE(error.message)
  }

  return
}

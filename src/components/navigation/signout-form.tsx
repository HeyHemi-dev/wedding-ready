'use client'

import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { queryKeys } from '@/app/_types/keys'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Form } from '@/components/ui/form'
import { tryCatch } from '@/utils/try-catch'
import { browserSupabase } from '@/utils/supabase/client'
import { SignOutFormAction } from './signout-form-action'
import { getOrigin } from '@/utils/api-helpers'
import { OPERATION_ERROR } from '@/app/_types/errors'
import { isProtectedPath } from '@/middleware-helpers'

export function SignOutFormMenuItem({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const form = useForm({})
  const queryClient = useQueryClient()

  async function onSubmit() {
    const { data, error } = await tryCatch(handleSignOut(pathname, queryClient))
    if (error) {
      toast.error(error.message)
      return
    }
    router.push(data.next)
    toast.success('You have beeen signed out')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DropdownMenuItem
          className="ui"
          onSelect={(event) => {
            event.preventDefault()
            form.handleSubmit(onSubmit)()
          }}>
          {children}
        </DropdownMenuItem>
      </form>
    </Form>
  )
}

async function handleSignOut(pathname: string, queryClient: QueryClient): Promise<{ next: string }> {
  const { error } = await browserSupabase.auth.signOut()

  if (error) {
    throw OPERATION_ERROR.INVALID_STATE(error.message)
  }

  queryClient.removeQueries({
    queryKey: queryKeys.authUser(),
  })

  return { next: isProtectedPath(pathname) ? '/sign-in' : pathname }
}
